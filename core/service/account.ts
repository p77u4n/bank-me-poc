import { DomainEvent, EventBus } from 'core/events/event-bus.base';
import * as Either from 'fp-ts/Either';
import { AccountAgg, accountTrait } from 'core/model/account';
import { pipe } from 'fp-ts/lib/function';
import { UUID } from 'core/model/vo';
import { v4 as uuidv4 } from 'uuid';
import * as Option from 'fp-ts/lib/Option';

export type TransactionStartEvent = DomainEvent<{
  sessionId: UUID;
  sourceAccId: UUID;
  targetAccId: UUID;
  amount: number;
}>;

export const TRANS_START_EVENT_NAME = 'transactionStart';

export type TransactionValidateOKEvent = DomainEvent<{
  sessionId: UUID;
  sourceAccId: UUID;
  targetAccId: UUID;
  amount: number;
}>;

export const TRANS_VALIDATE_OKE_EVENT_NAME = 'transactionValidateOK';

export type TransactionFailedEvent = DomainEvent<{
  sessionId: UUID;
  sourceAccId: UUID;
  targetAccId: UUID;
  amount: number;
  reason: Error;
}>;

export const TRANS_FINISH_EVENT_NAME = 'transactionFinish';

export type TransactionFinishEvent = DomainEvent<{
  sessionId: UUID;
}>;

export const TRANS_FAILED_EVENT_NAME = 'transactionValidateFailed';

export const transferMoney =
  (deps: { eventBus: EventBus }) =>
  (params: {
    amount: number;
    sourceAcc: AccountAgg;
    targetAcc: AccountAgg;
    sessionId: UUID;
  }) => {
    const date = new Date();
    const { amount, sourceAcc, targetAcc } = params;
    deps.eventBus.emit({
      name: TRANS_START_EVENT_NAME,
      data: {
        sessionId: params.sessionId,
        sourceAccId: sourceAcc.id,
        targetAccId: targetAcc.id,
        amount,
      },
    });

    const validateTrans = pipe(
      accountTrait.addTransactionIn(
        targetAcc,
        Option.some(sourceAcc),
        amount,
        date,
      ),
      Either.bindTo('checkTranIn'),
      Either.bind('checkTranOut', () =>
        accountTrait.addTransactionOut(sourceAcc, targetAcc, amount, date),
      ),
    );
    pipe(
      validateTrans,
      Either.match(
        (e) => {
          deps.eventBus.emit<TransactionFailedEvent>({
            name: TRANS_FAILED_EVENT_NAME,
            data: {
              sessionId: params.sessionId,
              sourceAccId: sourceAcc.id,
              targetAccId: targetAcc.id,
              amount,
              reason: e,
            },
          });
        },
        () =>
          deps.eventBus.emit<TransactionValidateOKEvent>({
            name: TRANS_VALIDATE_OKE_EVENT_NAME,
            data: {
              sessionId: params.sessionId,
              sourceAccId: sourceAcc.id,
              targetAccId: targetAcc.id,
              amount,
            },
          }),
      ),
    );
    return validateTrans;
  };

export const finishTransaction =
  (deps: { eventBus: EventBus }) => (params: { transactionId: UUID }) => {
    deps.eventBus.emit({
      name: TRANS_FINISH_EVENT_NAME,
      data: {
        sessionId: params.transactionId,
      },
    });
  };
