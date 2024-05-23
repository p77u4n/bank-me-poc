import { runExpress } from './ports/rest/restapi-view';
import { configDotenv } from 'dotenv';
import { EventBus } from 'core/events/event-bus.base';
import {
  TRANS_FAILED_EVENT_NAME,
  TRANS_FINISH_EVENT_NAME,
  TRANS_START_EVENT_NAME,
  TRANS_VALIDATE_OKE_EVENT_NAME,
} from 'core/service/account';
import { TransactionStart } from './event-listener/transaction-start';
import { postgresDTsource } from './db-typeorm/datasource';
import { TransactionFinishValidate } from './event-listener/transaction-validate-finish';
import { SimpleEventBus } from 'core/events/simple.event-bus';
import { PostgresUserRepo } from './repo/pg.user';
import { PostgresAccountRepo } from './repo/pg.account';
import { DefaultAccountCommandHandler } from './usecase/account.command';
import { Registry } from './registry.base';
import { ACCOUNT_INIT_SUCCESS } from 'core/model/account';
import { AccountInitFinishEventHandler } from './event-listener/account-init-success';
import { TransactionFailed } from './event-listener/transaction-failed';
import { TransactionFinish } from './event-listener/transaction-finish';
import { DefaultAccountQuery } from './usecase/account.query';
import { DefaultUserUsecaseCommandHandler } from './usecase/user.command';

configDotenv();

const configEventSubs = (eventBus: EventBus) => {
  eventBus.on(
    TRANS_START_EVENT_NAME,
    TransactionStart({ datasource: postgresDTsource }),
  );
  eventBus.on(
    TRANS_VALIDATE_OKE_EVENT_NAME,
    TransactionFinishValidate({ datasource: postgresDTsource, eventBus }),
  );
  eventBus.on(
    TRANS_FAILED_EVENT_NAME,
    TransactionFailed({ datasource: postgresDTsource }),
  );
  eventBus.on(
    TRANS_FINISH_EVENT_NAME,
    TransactionFinish({ datasource: postgresDTsource }),
  );
  eventBus.on(
    ACCOUNT_INIT_SUCCESS,
    AccountInitFinishEventHandler({ datasource: postgresDTsource }),
  );
};

const getSingleRegistry: () => Registry = () => {
  const eventBus = new SimpleEventBus();
  configEventSubs(eventBus);
  const userRepo = new PostgresUserRepo();
  const accountRepo = new PostgresAccountRepo();
  return {
    accountCommandHandler: new DefaultAccountCommandHandler(
      accountRepo,
      userRepo,
      eventBus,
    ),
    accountQueryHandler: new DefaultAccountQuery(accountRepo),
    userCommandHandler: new DefaultUserUsecaseCommandHandler(userRepo),
  };
};

const start = async () => {
  const registry = getSingleRegistry();
  runExpress(registry);
};

start();
