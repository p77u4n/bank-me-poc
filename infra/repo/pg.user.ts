import { Repository } from 'typeorm';
import * as TE from 'fp-ts/lib/TaskEither';
import * as Either from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import { UserRepo } from 'core/repo/user.repo';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMUser } from 'infra/db-typeorm/entities';
import { AggUser, parseAggUser } from 'core/model/user';

export class PostgresUserRepo implements UserRepo {
  private userRepository: Repository<DMUser> =
    postgresDTsource.getRepository(DMUser);

  constructor() {
    this.add = this.add.bind(this);
    this.findById = this.findById.bind(this);
    this.delete = this.delete.bind(this);
    this.update = this.update.bind(this);
  }

  add(user: AggUser): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmUser = this.toPersistence(user);
          await this.userRepository.save(dmUser);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  findById(id: string): TE.TaskEither<Error, AggUser> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmUser = await this.userRepository.findOne({ where: { id } });
          if (!dmUser) throw new Error('User not found');
          return dmUser;
        },
        (reason) => new Error(String(reason)),
      ),
      TE.chain(flow(this.toDomain, TE.fromEither)),
    );
  }

  delete(user: AggUser): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmUser = this.toPersistence(user);
          await this.userRepository.remove(dmUser);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  update(user: AggUser): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmUser = this.toPersistence(user);
          await this.userRepository.save(dmUser);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  private toPersistence(user: AggUser): DMUser {
    const dmUser = new DMUser();
    dmUser.id = user.id;
    dmUser.name = user.name;
    return dmUser;
  }

  private toDomain(dmUser: DMUser): Either.Either<Error, AggUser> {
    return parseAggUser({
      id: dmUser.id,
      name: dmUser.name,
      accounts: (dmUser.accounts || []).map((acc) => acc.id),
      // Add other KYC properties here
    });
  }
}
