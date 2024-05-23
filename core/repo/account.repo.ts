import { AccountAgg } from 'core/model/account';
import { Repo } from './repo.base';
import { TaskEither } from 'fp-ts/lib/TaskEither';
import { TransactionIn, TransactionOut } from 'core/model/transaction';

export interface AccountRepo extends Repo<AccountAgg> {
  findTransactionRelatedToAccountId(id: string): TaskEither<
    Error,
    {
      transIn: TransactionIn[];
      transOut: TransactionOut[];
    }
  >;
}
