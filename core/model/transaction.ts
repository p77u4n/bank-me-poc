import { pipe } from 'fp-ts/lib/function';
import { TransactionAmount, UUID, parseAmount, parseUUID } from './vo';
import * as Either from 'fp-ts/Either';
// Value Object Transaction
export interface Transaction {
  amount: TransactionAmount;
}

export interface TransactionIn extends Transaction {
  from: UUID;
}

export interface TransactionOut extends Transaction {
  to: UUID;
}

export type TransInParams = {
  from: string;
  amount: number;
};

export type TransOutParams = {
  to: string;
  amount: number;
};

export const parseTranIn = (params: TransInParams) =>
  pipe(
    parseUUID(params.from),
    Either.bindTo('from'),
    Either.bind('amount', () => parseAmount(params.amount)),
    Either.chain(({ from, amount }) => {
      // more validation here if needed
      return Either.right({
        from,
        amount,
      } as TransactionIn);
    }),
  );

export const parseTranOut = (params: TransOutParams) =>
  pipe(
    parseUUID(params.to),
    Either.bindTo('to'),
    Either.bind('amount', () => parseAmount(params.amount)),
    Either.chain(({ to, amount }) => {
      // more validation here if needed
      return Either.right({
        to,
        amount,
      } as TransactionOut);
    }),
  );
