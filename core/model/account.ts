import { Balance, UUID, parseUUID } from './vo';
import { pipe } from 'fp-ts/function';
import * as Either from 'fp-ts/Either';
import { v4 as uuidv4 } from 'uuid';
import { P, match } from 'ts-pattern';
import {
  TransInParams,
  TransOutParams,
  TransactionGeneral,
  TransactionIn,
  TransactionOut,
  isTransactionIn,
  isTransactionOut,
  parseTranIn,
  parseTranOut,
} from './transaction';
import { AggUser } from './user';
import { descend, prop, sortWith } from 'ramda';

export interface AccountAgg {
  id: UUID; // should use internal id like incremental integer, but for the sake of simplicity i use UUID here instead
  ownerId: UUID;
  balance: Balance;
  transactionsIn: TransactionIn[];
  transactionsOut: TransactionOut[];
}

type AccountInitParams = {
  id: string;
  ownerId: string;
  transactionsIn: TransInParams[];
  transactionsOut: TransOutParams[];
};

export const parseAccount = (params: AccountInitParams) =>
  pipe(
    parseUUID(params.id),
    Either.bindTo('uuid'),
    Either.bind('ownerId', () => parseUUID(params.ownerId)),
    Either.bind('transactionsIn', () =>
      pipe(
        params.transactionsIn,
        Either.traverseArray((tranInParams) => parseTranIn(tranInParams)),
      ),
    ),
    Either.bind('transactionsOut', () =>
      pipe(
        params.transactionsOut,
        Either.traverseArray((tranOutParams) => parseTranOut(tranOutParams)),
      ),
    ),
    Either.bind('balance', ({ transactionsIn, transactionsOut }) =>
      getBalanceFromTransactions(
        transactionsIn as TransactionIn[],
        transactionsOut as TransactionOut[],
      ),
    ),
    Either.chain(
      ({ uuid, balance, transactionsIn, transactionsOut, ownerId }) => {
        // more validation here if need
        return Either.right({
          id: uuid,
          ownerId,
          balance,
          transactionsIn,
          transactionsOut,
        } as AccountAgg);
      },
    ),
  );

const getBalanceFromTransactions = (
  inTrans: TransactionIn[],
  outTrans: TransactionOut[],
) =>
  Either.tryCatch(
    () => {
      const transSortByDate = sortWith([
        descend<TransactionGeneral>(prop('date')),
      ])([...inTrans, ...outTrans]);
      return transSortByDate.reduce((bal, trans) => {
        return match(trans)
          .with(P.when(isTransactionIn), (tr) => bal + tr.amount)
          .with(P.when(isTransactionOut), (tr) => {
            if (tr.amount > bal) {
              throw Error('TRANSACTION_STATE_INVALID');
            }
            return bal - tr.amount;
          })
          .run();
      }, 0);
    },
    (e) => e as Error,
  );

export const openNewAccount = (params: { user: AggUser }) => {
  const INIT_DEPOSIT_AMOUNT = 10;
  const validate = (user: AggUser) => {
    const isQualifiedToOpenAccount = () => {
      /// check if user is qualified for opening new account
      return true;
    };
    return Either.fromPredicate(isQualifiedToOpenAccount, () =>
      Error('USER_NOT_QUALIFIED'),
    )(user);
  };
  return pipe(
    params.user,
    validate,
    Either.bindTo('user'),
    Either.bind('tran', () =>
      parseTranIn({
        from: undefined,
        amount: INIT_DEPOSIT_AMOUNT,
        date: new Date(Date.now()),
      }),
    ),
    Either.map(
      ({ user, tran }) =>
        ({
          id: uuidv4(),
          ownerId: user.id,
          balance: tran.amount as unknown as Balance, // adhoc for simplicity
          transactionsIn: [tran],
          transactionsOut: [],
        }) as AccountAgg,
    ),
  );
};

// this method only for validate if the current state of
// acc can invoke an transaction for sending money, or
// for snapshot purpose

const addTransactionOut = (
  acc: AccountAgg,
  targetAcc: AccountAgg,
  amount: number,
  date: Date,
) => {
  const transactionOut = parseTranOut({
    date,
    amount,
    to: targetAcc.id,
  });
  return pipe(
    transactionOut,
    Either.chain((newTrans) => {
      const isValidOut = newTrans.amount < acc.balance;
      return isValidOut
        ? Either.right({
            ...acc,
            amount: acc.balance - newTrans.amount,
            transactionsOut: acc.transactionsOut.concat(newTrans),
          } as AccountAgg)
        : Either.left(new Error('INVALID_OUT_AMOUNT'));
    }),
  );
};

const addTransactionIn = (
  acc: AccountAgg,
  sourceAgg: AccountAgg,
  amount: number,
  date: Date,
) => {
  const transactionIn = parseTranIn({
    date,
    amount,
    from: sourceAgg.id,
  });
  return pipe(
    transactionIn,
    Either.chain((newTrans) => {
      const isValidIn = true; // do some validate check
      return isValidIn
        ? Either.right({
            ...acc,
            amount: acc.balance + newTrans.amount,
            transactionsIn: acc.transactionsIn.concat(newTrans),
          } as AccountAgg)
        : Either.left(new Error('INVALID_IN_AMOUNT'));
    }),
  );
};

export const accountTrait = {
  parse: parseAccount,
  addTransactionIn,
  addTransactionOut,
};
