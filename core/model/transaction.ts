import { pipe } from 'fp-ts/lib/function';
import { TransactionAmount, UUID, parseAmount, parseUUID } from './vo';
import * as Either from 'fp-ts/Either';
import * as Option from 'fp-ts/Option';
import { Brand } from 'core/types';
// Value Object Transaction
//
type TransactionDate = Brand<Date, 'TransactionDate'>;

const isTransactionDate = (date: Date): date is TransactionDate =>
  date < new Date(Date.now());

const parseTransDate = (date: Date) =>
  Either.fromPredicate(isTransactionDate, () => Error('INVALID_DATE'))(date);

export interface TransactionGeneral {
  tag: string;
  amount: TransactionAmount;
  date: Date;
}

export interface TransactionIn extends TransactionGeneral {
  from: Option.Option<UUID>;
}

export interface TransactionOut extends TransactionGeneral {
  to: UUID;
}

export type Transaction = TransactionIn | TransactionOut;

export const isTransactionIn = (
  transaction: Transaction,
): transaction is TransactionIn => transaction.tag === 'in';

export const isTransactionOut = (
  transaction: Transaction,
): transaction is TransactionOut => transaction.tag === 'out';

interface TransParams {
  amount: number;
  date: Date;
}

export interface TransInParams extends TransParams {
  from?: string;
}

export interface TransOutParams extends TransParams {
  to: string;
}

export const parseTranIn = (params: TransInParams) =>
  pipe(
    params.from
      ? pipe(parseUUID(params.from), Either.map(Option.some))
      : Either.right(Option.none),
    Either.bindTo('from'),
    Either.bind('amount', () => parseAmount(params.amount)),
    Either.bind('date', () => parseTransDate(params.date)),
    Either.chain(({ from, amount, date }) => {
      // more validation here if needed
      return Either.right({
        tag: 'in',
        from,
        amount,
        date: date,
      } as TransactionIn);
    }),
  );

export const parseTranOut = (params: TransOutParams) =>
  pipe(
    parseUUID(params.to),
    Either.bindTo('to'),
    Either.bind('amount', () => parseAmount(params.amount)),
    Either.bind('date', () => parseTransDate(params.date)),
    Either.chain(({ to, amount, date }) => {
      // more validation here if needed
      return Either.right({
        tag: 'out',
        to,
        amount,
        date,
      } as TransactionOut);
    }),
  );
