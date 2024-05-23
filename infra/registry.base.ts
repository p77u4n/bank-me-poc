import { AccountUsecaseCommand } from 'core/usecase/account.command';
import { AccountQuerier } from 'core/usecase/account.query';
import { UserUsecaseCommand } from 'core/usecase/user.command';

export interface Registry {
  accountCommandHandler: AccountUsecaseCommand;
  accountQueryHandler: AccountQuerier;
  userCommandHandler: UserUsecaseCommand;
}
