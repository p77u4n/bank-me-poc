import { UUID } from 'crypto';
import * as TE from 'fp-ts/TaskEither';
export interface Repo<AGRoot> {
  add(task: AGRoot): TE.TaskEither<Error, void>;
  findById(id: UUID): TE.TaskEither<Error, AGRoot>;
  delete(task: AGRoot): TE.TaskEither<Error, void>;
  update(task: AGRoot): TE.TaskEither<Error, void>; // explicit saving
}
