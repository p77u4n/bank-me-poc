import { EventHandler } from 'core/events/event-bus.base';
import { TransactionFailedEvent } from 'core/service/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import { DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';

export const TransactionFailed: Reader.Reader<
  { datasource: DataSource },
  EventHandler<TransactionFailedEvent>
> =
  ({ datasource }) =>
  ({ sessionId, reason }) =>
    TE.tryCatch(
      async () => {
        const transactionRepo = datasource.getRepository(DMTransaction);
        const newTrans = await transactionRepo.findOneById(sessionId);
        if (!newTrans) {
          throw new Error('TRANSACITON_NOT_FOUND');
        }
        newTrans.status = 'FAILED';
        newTrans.reason = reason.message;
        return transactionRepo.save(newTrans);
      },
      (e) => e as Error,
    );
