import { TaskEither } from 'fp-ts/lib/TaskEither';

export interface CreateUserDTO {
  userId: string;
}

export interface UserUsecaseCommand {
  createAnUser(commandParams: {
    name: string;
  }): TaskEither<Error, CreateUserDTO>;
}
