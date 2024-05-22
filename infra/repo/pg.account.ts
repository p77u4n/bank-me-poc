import * as TE from 'fp-ts/lib/TaskEither';
import * as Either from 'fp-ts/lib/Either';
import { flow, pipe } from 'fp-ts/lib/function';
import { AccountRepo } from 'core/repo/account.repo';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMAccount } from 'infra/db-typeorm/entities';
import { AccountAgg, parseAccount } from 'core/model/account';

export class PostgresAccountRepo implements AccountRepo {
  private accRepository = postgresDTsource.getRepository(DMAccount);

  add(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = this.toPersistence(acc);
          await this.accRepository.save(dmacc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  findById(id: string): TE.TaskEither<Error, AccountAgg> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = await this.accRepository.findOne({
            where: { id: id },
          });
          if (!dmacc) throw new Error('acc not found');
          return dmacc;
        },
        (reason) => new Error(String(reason)),
      ),
      TE.chain(flow(this.toDomain, TE.fromEither)),
    );
  }

  delete(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmAcc = this.toPersistence(acc);
          await this.accRepository.remove(dmAcc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  update(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = this.toPersistence(acc);
          await this.accRepository.save(dmacc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  private toPersistence(acc: AccountAgg): DMAccount {
    const dmAcc = new DMAccount();
    dmAcc.user_id = acc.ownerId;
    dmAcc.balance = acc.balance;
    dmAcc.id = acc.id;
    return dmAcc;
  }

  private toDomain(dmacc: DMAccount): Either.Either<Error, AccountAgg> {
    return parseAccount({
      id: dmacc.id,
      ownerId: dmacc.user_id,
      transactionsIn: [],
      transactionsOut: [],
    });
  }
}
