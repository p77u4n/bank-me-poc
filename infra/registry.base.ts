import { AccountUsecaseCommand } from 'core/usecase/account.command';

export interface Registry {
  commandService: AccountUsecaseCommand;
}
