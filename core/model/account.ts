import { Balance, UUID } from './vo';

export interface AccountEntity {
  id: UUID; // should use internal id like incremental integer, but for the sake of simplicity i use UUID here instead
  balance: Balance;
}
