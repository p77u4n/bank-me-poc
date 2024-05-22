import { EventBus, EventHandler } from 'core/events/event-bus.base';
import { TransactionFinishEvent } from 'core/service/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import { DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';

export const TransactionFinish: Reader.Reader<
  { datasource: DataSource; eventBus: EventBus },
  EventHandler<TransactionFinishEvent>
> =
  ({ datasource }) =>
  ({ sessionId }) =>
    TE.tryCatch(
      async () => {
        const transactionRepo = datasource.getRepository(DMTransaction);
        const newTrans = await transactionRepo.findOneById(sessionId);
        if (!newTrans) {
          throw new Error('TRANSACITON_NOT_FOUND');
        }
        newTrans.status = 'FINISH';
        return transactionRepo.save(newTrans);
      },
      (e) => e as Error,
    );
