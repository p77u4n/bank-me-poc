import { NonEmptyString, UUID, parseNES, parseUUID } from './vo';
import { pipe } from 'fp-ts/function';
import * as Either from 'fp-ts/Either';

// Aggregate User - only hold user information
export interface AggUser {
  id: UUID;
  name: NonEmptyString;
  /// more KYC can be here
}

export const parseAggUser = (params: {
  id: string;
  name: string;
  accounts: string[];
}) =>
  pipe(
    parseUUID(params.id),
    Either.bindTo('id'),
    Either.bind('name', () => parseNES(params.name)),
    Either.chain(({ id, name }) =>
      Either.right({
        id,
        name,
      } as AggUser),
    ),
  );
