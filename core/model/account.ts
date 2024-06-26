import { Balance, UUID, parseBalance, parseUUID } from './vo';
import { pipe } from 'fp-ts/function';
import * as Either from 'fp-ts/Either';
import * as Option from 'fp-ts/Option';
import { v4 as uuidv4 } from 'uuid';
import { P, match } from 'ts-pattern';
import {
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
import { DomainEvent, EventBus } from 'core/events/event-bus.base';

export interface AccountAgg {
  id: UUID; // should use internal id like incremental integer, but for the sake of simplicity i use UUID here instead
  ownerId: UUID;
  balance: Balance;
}

export const INIT_DEPOSIT_AMOUNT = 10 as Balance;
export const ACCOUNT_INIT_SUCCESS = 'accountInitSuccess';

export type AccountInitSuccessEvent = DomainEvent<{
  accountId: UUID;
  sessionId: UUID;
  balance: Balance;
}>;

type AccountInitParams = {
  id: string;
  ownerId: string;
  balance: number;
};

export const parseAccount = (params: AccountInitParams) =>
  pipe(
    parseUUID(params.id),
    Either.bindTo('uuid'),
    Either.bind('ownerId', () => parseUUID(params.ownerId)),
    Either.bind('balance', () => parseBalance(params.balance)),
    Either.chain(({ uuid, balance, ownerId }) => {
      // more validation here if need
      return Either.right({
        id: uuid,
        ownerId,
        balance,
      } as AccountAgg);
    }),
  );

const getBalanceFromTransactions = (
  inTrans: readonly TransactionIn[],
  outTrans: readonly TransactionOut[],
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

export const openNewAccount =
  (eventBus: EventBus) => (params: { user: AggUser }) => {
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
      Either.bind('acc', ({ user }) =>
        parseAccount({
          id: uuidv4(),
          ownerId: user.id,
          balance: 0,
        }),
      ),
      Either.chain(({ acc }) =>
        addTransactionIn(acc, Option.none, INIT_DEPOSIT_AMOUNT, new Date()),
      ),
      Either.tap((acc) => {
        eventBus.emit<AccountInitSuccessEvent>({
          name: ACCOUNT_INIT_SUCCESS,
          data: {
            accountId: acc.id,
            balance: acc.balance,
            sessionId: uuidv4() as UUID,
          },
        });
        return Either.right(null);
      }),
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
      const isValidOut = newTrans.amount <= acc.balance;
      return isValidOut
        ? Either.right({
            ...acc,
            amount: acc.balance - newTrans.amount,
          } as AccountAgg)
        : Either.left(new Error('INVALID_OUT_AMOUNT'));
    }),
  );
};

const addTransactionIn = (
  acc: AccountAgg,
  sourceAgg: Option.Option<AccountAgg>,
  amount: number,
  date: Date,
) => {
  const transactionIn = parseTranIn({
    date,
    amount,
    from: Option.getOrElse(() => undefined)(
      Option.map((agg: AccountAgg) => agg.id)(sourceAgg),
    ),
  });
  return pipe(
    transactionIn,
    Either.chain((newTrans) => {
      const isValidIn = true; // do some validate check
      return isValidIn
        ? Either.right({
            ...acc,
            amount: acc.balance + newTrans.amount,
          } as AccountAgg)
        : Either.left(new Error('INVALID_IN_AMOUNT'));
    }),
  );
};

export const accountTrait = {
  parse: parseAccount,
  addTransactionIn,
  addTransactionOut,
  openNewAccount,
  getBalanceFromTransactions,
};
