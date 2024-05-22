import { AccountAgg } from 'core/model/account';
import { AggUser } from 'core/model/user';
import { UUID } from 'crypto';
import * as TE from 'fp-ts/TaskEither';

export interface AccountUsecase {
  openNewAccount(user: AggUser): TE.TaskEither<Error, AccountAgg>;
  transferMoney(
    sourceAccId: UUID,
    targetAccId: UUID,
    amount: number,
  ): TE.TaskEither<Error, void>;
}
