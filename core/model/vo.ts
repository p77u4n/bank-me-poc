import { Brand } from 'core/types';
import { validate } from 'uuid';

export type UUID = Brand<string, 'UUID'>;

export function isUUID(v: string): v is UUID {
  return validate(v);
}

export type NonEmptyString = Brand<string, 'NonEmptyString'>;

export function isNonEmptyString(v: string): v is NonEmptyString {
  return v.length > 0;
}

export type Balance = Brand<number, 'Balance'>;

export function isValidBalance(v: number): v is Balance {
  return v > 0;
}

export type TransactionAmount = Brand<number, 'TransactionAmount'>;

export function isValidTransAmount(v: number): v is TransactionAmount {
  return v > 0;
}
