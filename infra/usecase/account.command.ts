import {
  ACCOUNT_INIT_SUCCESS,
  AccountInitSuccessEvent,
  INIT_DEPOSIT_AMOUNT,
  accountTrait,
} from 'core/model/account';
import { AccountRepo } from 'core/repo/account.repo';
import { UserRepo } from 'core/repo/user.repo';
import {
  AccountCreateDTO,
  AccountUsecaseCommand,
} from 'core/usecase/account.command';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { UUID } from 'core/model/vo';
import { transferMoney } from 'core/service/account';
import { EventBus } from 'core/events/event-bus.base';
import { v4 } from 'uuid';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMTransaction } from 'infra/db-typeorm/entities';

export class DefaultAccountCommandHandler implements AccountUsecaseCommand {
  constructor(
    private accountRepo: AccountRepo,
    private userRepo: UserRepo,
    private eventBus: EventBus,
  ) {}

  openNewAccount(commandParams: {
    userId: string;
  }): TaskEither<Error, AccountCreateDTO> {
    return pipe(
      commandParams.userId as UUID,
      this.userRepo.findById,
      TE.chain((user) =>
        TE.fromEither(accountTrait.openNewAccount(this.eventBus)({ user })),
      ),
      TE.chain((acc) =>
        pipe(
          acc,
          this.accountRepo.add,
          TE.map(() => acc),
        ),
      ),
      TE.tapIO((acc) => () => {
        this.eventBus.emit<AccountInitSuccessEvent>({
          name: ACCOUNT_INIT_SUCCESS,
          data: {
            accountId: acc.id,
            balance: INIT_DEPOSIT_AMOUNT,
            sessionId: v4() as UUID,
          },
        });
        return TE.right(null);
      }),
      TE.map((acc) => ({
        accountId: acc.id,
      })),
    );
  }

  transferMoney(commandParams: {
    sourceAccId: string;
    targetAccId: string;
    amount: number;
  }): TaskEither<Error, any> {
    return pipe(
      this.accountRepo.findById(commandParams.sourceAccId as UUID),
      TE.bindTo('sourceAcc'),
      TE.bind('targetAcc', () =>
        this.accountRepo.findById(commandParams.targetAccId as UUID),
      ),
      TE.bind('newTransaction', ({ sourceAcc, targetAcc }) =>
        TE.tryCatch(
          async () => {
            const dmTransRepo = postgresDTsource.getRepository(DMTransaction);
            const newTrans = new DMTransaction();
            newTrans.source_account_id = sourceAcc.id;
            newTrans.target_account_id = targetAcc.id;
            newTrans.amount = commandParams.amount;
            newTrans.status = 'START';
            newTrans.id = v4();
            await dmTransRepo.save(newTrans);
            return newTrans.id;
          },
          (e) => e as Error,
        ),
      ),
      TE.chain(({ sourceAcc, targetAcc, newTransaction }) =>
        pipe(
          TE.fromEither(
            transferMoney({ eventBus: this.eventBus })({
              sessionId: newTransaction as UUID,
              amount: commandParams.amount,
              sourceAcc,
              targetAcc,
            }),
          ),
          TE.mapError(
            (e) =>
              new Error(
                JSON.stringify({
                  transactionId: newTransaction,
                  error: e,
                }),
              ),
          ),
        ),
      ),
    );
  }
}
