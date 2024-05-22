import { AccountAgg, accountTrait } from 'core/model/account';
import { AccountRepo } from 'core/repo/account.repo';
import { UserRepo } from 'core/repo/user.repo';
import { AccountUsecaseCommand } from 'core/usecase/account.command';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { UUID } from 'core/model/vo';
import { transferMoney } from 'core/service/account';
import { EventBus } from 'core/events/event-bus.base';

export class DefaultAccountCommandHandler implements AccountUsecaseCommand {
  constructor(
    private accountRepo: AccountRepo,
    private userRepo: UserRepo,
    private eventBus: EventBus,
  ) {}
  openNewAccount(userId: string): TaskEither<Error, AccountAgg> {
    return pipe(
      userId as UUID,
      this.userRepo.findById,
      TE.chain((user) => TE.fromEither(accountTrait.openNewAccount({ user }))),
      TE.chain((acc) =>
        pipe(
          acc,
          this.accountRepo.add,
          TE.map(() => acc),
        ),
      ),
    );
  }

  transferMoney(
    sourceAccId: string,
    targetAccId: string,
    amount: number,
  ): TaskEither<Error, any> {
    return pipe(
      this.accountRepo.findById(sourceAccId as UUID),
      TE.bindTo('sourceAcc'),
      TE.bind('targetAcc', () =>
        this.accountRepo.findById(targetAccId as UUID),
      ),
      TE.tapIO(
        ({ sourceAcc, targetAcc }) =>
          () =>
            transferMoney({ eventBus: this.eventBus })({
              amount,
              sourceAcc,
              targetAcc,
            }),
      ),
    );
  }
}
