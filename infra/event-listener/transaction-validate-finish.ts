import { EventBus, EventHandler } from 'core/events/event-bus.base';
import {
  TransactionValidateOKEvent,
  finishTransaction,
} from 'core/service/account';
import * as Reader from 'fp-ts/Reader';
import * as TE from 'fp-ts/TaskEither';
import { DMTransaction } from 'infra/db-typeorm/entities';
import { DataSource } from 'typeorm';

export const TransactionFinishValidate: Reader.Reader<
  { datasource: DataSource; eventBus: EventBus },
  EventHandler<TransactionValidateOKEvent>
> =
  ({ datasource, eventBus }) =>
  ({ sessionId }) =>
    TE.tryCatch(
      async () => {
        const transactionRepo = datasource.getRepository(DMTransaction);
        const newTrans = await transactionRepo.findOneById(sessionId);
        if (!newTrans) {
          throw new Error('TRANSACITON_NOT_FOUND');
        }
        newTrans.status = 'FINISH_VALIDATE';
        finishTransaction({ eventBus: eventBus })({ transactionId: sessionId });
        return transactionRepo.save(newTrans);
      },
      (e) => e as Error,
    );
