import { EventHandler } from 'core/events/event-bus.base';
import { AccountInitSuccessEvent } from 'core/model/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import { DMAccount, DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';

export const AccountInitFinishEventHandler: Reader.Reader<
  { datasource: DataSource },
  EventHandler<AccountInitSuccessEvent>
> =
  ({ datasource }) =>
  ({ accountId, balance, sessionId }) =>
    TE.tryCatch(
      async () => {
        const newTransaction = new DMTransaction();
        newTransaction.id = sessionId; // idenpotent purpose
        newTransaction.amount = balance;
        await datasource.transaction(async (entityMan) => {
          const transactionRepo = entityMan.getRepository(DMTransaction);
          const accountRepo = entityMan.getRepository(DMAccount);
          accountRepo.update(accountId, {
            is_ready: true,
          });
          await transactionRepo.save(newTransaction);
        });
      },
      (e) => e as Error,
    );
