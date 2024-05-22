import { AccountEntity } from './account';
import { TransactionAmount } from './vo';

export interface VOTransaction {
  from: AccountEntity;
  to: AccountEntity;
  amount: TransactionAmount;
}
