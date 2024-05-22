import { AccountUsecaseCommand } from 'core/usecase/account.command';
import express from 'express';

export const AccRoute = (service: AccountUsecaseCommand) => {
  const taskRoute = express.Router();
  taskRoute.get('/me', (req, res) => {
    res.status(200).send('ok');
  });
  taskRoute.post('/create-new-account', async (req, res) => {});
  taskRoute.post('/transfer', async (req, res) => {});
  return taskRoute;
};
