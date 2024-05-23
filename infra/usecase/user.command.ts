import { UserRepo } from 'core/repo/user.repo';
import { createNewUser } from 'core/service/user';
import { CreateUserDTO, UserUsecaseCommand } from 'core/usecase/user.command';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

export class DefaultUserUsecaseCommandHandler implements UserUsecaseCommand {
  constructor(private userRepository: UserRepo) {}
  createAnUser(commandParams: {
    name: string;
  }): TE.TaskEither<Error, CreateUserDTO> {
    return pipe(
      commandParams.name,
      createNewUser,
      TE.fromEither,
      TE.tap(this.userRepository.add),
      TE.map((user) => ({
        userId: user.id,
      })),
    );
  }
}
