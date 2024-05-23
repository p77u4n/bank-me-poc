import { EventHandler } from 'core/events/event-bus.base';
import { UUID } from 'core/model/vo';
import { AccountRepo } from 'core/repo/account.repo';
import { TransactionFinishEvent } from 'core/service/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import * as Either from 'fp-ts/Either';
import { DMAccount, DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';
import { AccountAgg } from 'core/model/account';
import { pipe } from 'fp-ts/lib/function';

export const TransactionFinish: Reader.Reader<
  { datasource: DataSource; accountRepo: AccountRepo },
  EventHandler<TransactionFinishEvent>
> =
  ({ datasource, accountRepo }) =>
  ({ sessionId }) =>
    TE.tryCatch(
      async () => {
        const transactionRepo = datasource.getRepository(DMTransaction);
        const dmAccountRepo = datasource.getRepository(DMAccount);
        const newTrans = await transactionRepo.findOneById(sessionId);
        const sourceAccR = await accountRepo.findById(
          newTrans.source_account_id as UUID,
        )();
        const getAcc = (acc: Either.Either<Error, AccountAgg>) =>
          pipe(
            acc,
            Either.getOrElse(() => {
              throw Error('TARGET');
            }),
          ) as AccountAgg;
        const sourceAcc = getAcc(sourceAccR);
        await dmAccountRepo.update(sourceAcc.id, {
          balance: sourceAcc.balance,
        });
        const targetAccR = await accountRepo.findById(
          newTrans.target_account_id as UUID,
        )();

        const targetAcc = getAcc(targetAccR);
        await dmAccountRepo.update(targetAcc.id, {
          balance: targetAcc.balance,
        });
        if (!newTrans) {
          throw new Error('TRANSACITON_NOT_FOUND');
        }
        newTrans.status = 'FINISH';
        return transactionRepo.save(newTrans);
      },
      (e) => e as Error,
    );
