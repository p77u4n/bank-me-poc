import * as TE from 'fp-ts/TaskEither';

export type AccountCreateDTO = {
  accountId: string;
};
export interface AccountUsecaseCommand {
  openNewAccount(commandParams: {
    userId: string;
  }): TE.TaskEither<Error, AccountCreateDTO>;
  transferMoney(commandParams: {
    sourceAccId: string;
    targetAccId: string;
    amount: number;
  }): TE.TaskEither<Error, any>;
}
