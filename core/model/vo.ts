import { Brand } from 'core/types';
import { validate } from 'uuid';
import * as Either from 'fp-ts/Either';

export type UUID = Brand<string, 'UUID'>;

export function isUUID(v: string): v is UUID {
  return validate(v);
}

export const parseUUID = (v: string) =>
  Either.fromPredicate(isUUID, () => Error('WRONG_UUID'))(v);

export type NonEmptyString = Brand<string, 'NonEmptyString'>;

export function isNonEmptyString(v: string): v is NonEmptyString {
  return v.length > 0;
}

export const parseNES = (v: string) =>
  Either.fromPredicate(isNonEmptyString, () =>
    Error('STRING_SHOULD_BE_NON_EMPTY'),
  )(v);

export type Balance = Brand<number, 'Balance'>;

export function isValidBalance(v: number): v is Balance {
  return v > 0;
}

export const parseBalance = (v: number) =>
  Either.fromPredicate(isValidBalance, () => Error('INVALID_BALANCE'))(v);

export type TransactionAmount = Brand<number, 'TransactionAmount'>;

export function isValidTransAmount(v: number): v is TransactionAmount {
  return v > 0;
}

export const parseAmount = (v: number) =>
  Either.fromPredicate(isValidTransAmount, () => Error('INVALID_BALANCE'))(v);
