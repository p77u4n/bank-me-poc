import * as TE from 'fp-ts/lib/TaskEither';
import * as Either from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { AccountRepo } from 'core/repo/account.repo';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMAccount, DMTransaction } from 'infra/db-typeorm/entities';
import { AccountAgg, accountTrait, parseAccount } from 'core/model/account';
import {
  TransactionIn,
  TransactionOut,
  parseTranIn,
  parseTranOut,
} from 'core/model/transaction';

export enum exceptions {
  ACCOUNT_NOT_FOUND = 'ACC_NOT_FOUND',
}
export class PostgresAccountRepo implements AccountRepo {
  private accRepository = postgresDTsource.getRepository(DMAccount);
  private datasource = postgresDTsource;

  add(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = this.toPersistence(acc);
          await this.accRepository.save(dmacc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  findTransactionRelatedToAccountId(id: string) {
    return pipe(
      TE.tryCatch(
        async () => {
          const transRepo = this.datasource.getRepository(DMTransaction);
          const transInDM = await transRepo.findBy({
            status: 'FINISH',
            target_account_id: id,
          });
          const transOutDM = await transRepo.findBy({
            status: 'FINISH',
            source_account_id: id,
          });
          return {
            transOutDM,
            transInDM,
          };
        },
        (e) => e as Error,
      ),
      TE.bind('parsedTransOut', ({ transOutDM }) =>
        TE.fromEither(
          pipe(
            transOutDM,
            Either.traverseArray((transOut) =>
              parseTranOut({
                amount: transOut.amount,
                to: transOut.target_account_id,
                date: transOut.date,
              }),
            ),
          ),
        ),
      ),
      TE.bind('parsedTransIn', ({ transInDM }) =>
        TE.fromEither(
          pipe(
            transInDM,
            Either.traverseArray((tIn) =>
              parseTranIn({
                amount: tIn.amount,
                from: tIn.source_account_id,
                date: tIn.date,
              }),
            ),
          ),
        ),
      ),
      TE.map(({ parsedTransIn, parsedTransOut }) => ({
        transIn: parsedTransIn as TransactionIn[],
        transOut: parsedTransOut as TransactionOut[],
      })),
    );
  }

  findById(id: string): TE.TaskEither<Error, AccountAgg> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = await this.accRepository.findOne({
            where: { id: id },
          });
          if (!dmacc) throw new Error(exceptions.ACCOUNT_NOT_FOUND);
          return dmacc;
        },
        (reason) => new Error(String(reason)),
      ),
      TE.bindTo('dmacc'),
      TE.bind('trans', () => this.findTransactionRelatedToAccountId(id)),
      TE.chain(({ dmacc, trans }) =>
        pipe(
          this.toDomain(dmacc, trans.transIn, trans.transOut),
          TE.fromEither,
        ),
      ),
    );
  }

  delete(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmAcc = this.toPersistence(acc);
          await this.accRepository.remove(dmAcc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  update(acc: AccountAgg): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch(
        async () => {
          const dmacc = this.toPersistence(acc);
          await this.accRepository.save(dmacc);
        },
        (reason) => new Error(String(reason)),
      ),
    );
  }

  private toPersistence(acc: AccountAgg): DMAccount {
    const dmAcc = new DMAccount();
    dmAcc.user_id = acc.ownerId;
    dmAcc.balance = acc.balance;
    dmAcc.id = acc.id;
    return dmAcc;
  }

  private toDomain(
    dmacc: DMAccount,
    transactionsIn: readonly TransactionIn[],
    transactionsOut: readonly TransactionOut[],
  ): Either.Either<Error, AccountAgg> {
    return pipe(
      accountTrait.getBalanceFromTransactions(transactionsIn, transactionsOut),
      Either.chain((balance) =>
        parseAccount({
          id: dmacc.id,
          ownerId: dmacc.user_id,
          balance,
        }),
      ),
    );
  }
}
