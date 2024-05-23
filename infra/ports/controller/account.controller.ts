import { AccountUsecaseCommand } from 'core/usecase/account.command';
import { AccountQuerier } from 'core/usecase/account.query';
import * as Either from 'fp-ts/Either';
import express from 'express';
import { pipe } from 'fp-ts/lib/function';

export const AccRoute = (
  accountCommand: AccountUsecaseCommand,
  accountQuery: AccountQuerier,
) => {
  const taskRoute = express.Router();
  taskRoute.post('/', async (req, res) => {
    const userId = req.query.userId as string;
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
