import { parseAggUser } from 'core/model/user';
import { parseNES } from 'core/model/vo';
import { pipe } from 'fp-ts/lib/function';
import { v4 as uuidv4 } from 'uuid';
import * as Either from 'fp-ts/Either';

export const createNewUser = (name: string) =>
  pipe(
    name,
    parseNES,
    Either.chain((name) =>
      parseAggUser({
        id: uuidv4(),
        name,
        accounts: [],
      }),
    ),
  );
