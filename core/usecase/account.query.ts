import * as TE from 'fp-ts/TaskEither';
import * as Option from 'fp-ts/Option';

export interface AccountDTO {
  userId: string;
  balance: number;
}

export interface TransactionDTO {
  amount: number;
  from?: string;
  to?: string;
}

export interface AccountTransactionsDTO {
  trans: TransactionDTO[];
  page: number;
  total: number;
}

export interface AccountQuerier {
  getDetail(queryParam: {
    accountId: string;
  }): TE.TaskEither<Error, Option.Option<AccountDTO>>;
  getAccountTransactions(queryParam: {
    accountId: string;
    page: number;
    limit: number;
  }): TE.TaskEither<Error, AccountTransactionsDTO>;
}
