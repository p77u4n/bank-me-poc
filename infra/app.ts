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
import { DefaultAccountCommandHandler } from './usecase/account';
import { Registry } from './registry.base';

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
    TransactionFinishValidate({ datasource: postgresDTsource, eventBus }),
  );
  eventBus.on(
    TRANS_FINISH_EVENT_NAME,
    TransactionFinishValidate({ datasource: postgresDTsource, eventBus }),
  );
};

const getSingleRegistry: () => Registry = () => {
  const eventBus = new SimpleEventBus();
  configEventSubs(eventBus);
  const userRepo = new PostgresUserRepo();
  const accountRepo = new PostgresAccountRepo();
  return {
    commandService: new DefaultAccountCommandHandler(
      accountRepo,
      userRepo,
      eventBus,
    ),
  };
};

const start = async () => {
  const registry = getSingleRegistry();
  runExpress(registry);
};

start();
