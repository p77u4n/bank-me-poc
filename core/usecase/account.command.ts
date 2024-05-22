import { AccountAgg } from 'core/model/account';
import * as TE from 'fp-ts/TaskEither';

export interface AccountUsecaseCommand {
  openNewAccount(userId: string): TE.TaskEither<Error, AccountAgg>;
  transferMoney(
    sourceAccId: string,
    targetAccId: string,
    amount: number,
  ): TE.TaskEither<Error, any>;
}
