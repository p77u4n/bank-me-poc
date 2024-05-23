import { AccountUsecaseCommand } from 'core/usecase/account.command';
import { AccountQuerier } from 'core/usecase/account.query';
import * as Either from 'fp-ts/Either';
import * as Option from 'fp-ts/Option';
import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import { postgresDTsource } from 'infra/db-typeorm/datasource';
import { DMTransaction } from 'infra/db-typeorm/entities';

export const AccRoute = (
  accountCommand: AccountUsecaseCommand,
  accountQuery: AccountQuerier,
) => {
  const taskRoute = express.Router();
  taskRoute.post('/', async (req, res) => {
    const userId = req.body.userId as string;
    const result = await accountCommand.openNewAccount({ userId })();
    pipe(
      result,
      Either.match(
        (error) => {
          res.status(400).send({ detail: error.message });
        },
        (accountDTO) =>
          res.status(200).send({
            acountId: accountDTO.accountId,
          }),
      ),
    );
  });
  taskRoute.post('/transfer', async (req, res) => {
    const sourceAccId = req.body.sourceAccId;
    const targetAccId = req.body.targetAccId;
    const amount = parseFloat(req.body.amount);
    const result = await accountCommand.transferMoney({
      sourceAccId,
      targetAccId,
      amount,
    })();
    pipe(
      result,
      Either.match(
        (error) => {
          res.status(400).send({ detail: error.message });
        },
        () => {
          res.status(200).send('OK');
        },
      ),
    );
  });
  taskRoute.get('/:accountId', async (req, res) => {
    const accountId = req.params.accountId;
    const result = await accountQuery.getDetail({ accountId: accountId })();
    pipe(
      result,
      Either.match(
        (error) => {
          res.status(400).send({ detail: error.message });
        },
        Option.match(
          () => res.status(404).end(),
          (acc) => res.status(200).send({ data: acc }),
        ),
      ),
    );
  });

  taskRoute.get('/trans/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;
    const dmTranRepo = postgresDTsource.getRepository(DMTransaction);
    const trans = await dmTranRepo.findOneById(transactionId);
    return trans
      ? res.status(200).send({ data: trans })
      : res.status(404).end();
  });
  taskRoute.get('/:accountId/transactions', async (req, res) => {
    const accountId = req.params.accountId;
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    const result = await accountQuery.getAccountTransactions({
      accountId,
      page,
      limit,
    })();
    pipe(
      result,
      Either.match(
        (error) => {
          res.status(400).send({ detail: error.message });
        },
        (commandRes) => {
          res.status(200).send({
            data: commandRes,
          });
        },
      ),
    );
  });
  return taskRoute;
};
