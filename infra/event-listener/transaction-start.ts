import { EventHandler } from 'core/events/event-bus.base';
import { TransactionStartEvent } from 'core/service/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import { DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';

export const TransactionStart: Reader.Reader<
  { datasource: DataSource },
  EventHandler<TransactionStartEvent>
> =
  ({ datasource }) =>
  ({ sessionId, sourceAccId, targetAccId, amount }) =>
    TE.tryCatch(
      () => {
        const transactionRepo = datasource.getRepository(DMTransaction);
        const newTrans = new DMTransaction();
        newTrans.source_account_id = sourceAccId;
        newTrans.target_account_id = targetAccId;
        newTrans.amount = amount;
        newTrans.status = 'START';
        newTrans.id = sessionId;
        return transactionRepo.save(newTrans);
      },
      (e) => e as Error,
    );
