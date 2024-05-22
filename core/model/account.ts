import { Balance, UUID, parseBalance, parseUUID } from './vo';
import { pipe } from 'fp-ts/function';
import * as Either from 'fp-ts/Either';
import {
  TransInParams,
  TransOutParams,
  TransactionIn,
  TransactionOut,
  parseTranIn,
  parseTranOut,
} from './transaction';

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
  balance: number;
  transactionsIn: TransInParams[];
  transactionsOut: TransOutParams[];
};

export const parseAccount = (params: AccountInitParams) =>
  pipe(
    parseUUID(params.id),
    Either.bindTo('uuid'),
    Either.bind('ownerId', () => parseUUID(params.ownerId)),
    Either.bind('balance', () => parseBalance(params.balance)),
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
