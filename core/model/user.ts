import { AccountEntity } from './account';
import { NonEmptyString, UUID } from './vo';

// Aggregate User
export interface AggUser {
  id: UUID;
  name: NonEmptyString;
  accounts: AccountEntity[];
}
