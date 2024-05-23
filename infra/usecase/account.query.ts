import { parseUUID } from 'core/model/vo';
import { AccountRepo } from 'core/repo/account.repo';
import {
  AccountDTO,
  AccountQuerier,
  AccountTransactionsDTO,
} from 'core/usecase/account.query';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as Option from 'fp-ts/Option';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMTransaction } from 'infra/db-typeorm/entities';
import { exceptions } from 'infra/repo/pg.account';
import { match, P } from 'ts-pattern';

export class DefaultAccountQuery implements AccountQuerier {
  private datasource = postgresDTsource;
  constructor(private accountRepository: AccountRepo) {}
  getDetail(queryParam: {
    accountId: string;
  }): TE.TaskEither<Error, Option.Option<AccountDTO>> {
    return pipe(
      queryParam.accountId,
      parseUUID,
      TE.fromEither,
      TE.chain(this.accountRepository.findById),
      TE.map(
        (acc) =>
          ({
            userId: acc.ownerId,
            balance: acc.balance,
          }) as AccountDTO,
      ),
      TE.map(Option.some),
      TE.orElse((error) =>
        match(error.message)
          .with(exceptions.ACCOUNT_NOT_FOUND, () => TE.right(Option.none))
          .otherwise(() => TE.left(error)),
      ),
    );
  }
  getAccountTransactions(queryParam: {
    accountId: string;
    page: number;
    limit: number;
  }): TE.TaskEither<Error, AccountTransactionsDTO> {
    return TE.tryCatch(
      async () => {
        const dmTransRepo = this.datasource.getRepository(DMTransaction);
        const where = [
          {
            status: 'FINISH',
            target_account_id: queryParam.accountId,
          },
          {
            status: 'FINISH',
            source_account_id: queryParam.accountId,
          },
        ];
        const count = await dmTransRepo.countBy(where);
        const transDM = await dmTransRepo.find({
          where,
          skip: (queryParam.page - 1) * queryParam.limit,
          take: queryParam.limit,
        });
        return {
          total: count,
          page: queryParam.page,
          trans: transDM.map((t) =>
            match([t.source_account_id, t.target_account_id])
              .with(
                [queryParam.accountId, P.not(queryParam.accountId)],
                () => ({
                  to: t.target_account_id,
                  amount: t.amount,
                }),
              )
              .with(
                [P.not(queryParam.accountId), queryParam.accountId],
                () => ({
                  from: t.source_account_id,
                  amount: t.amount,
                }),
              )
              .otherwise(() => {
                throw new Error('INVALID_STATE_OF_TRANSACTION');
              }),
          ),
        };
      },
      (e) => e as Error,
    );
  }
}
