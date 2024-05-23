import * as Either from 'fp-ts/Either';
import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import { UserUsecaseCommand } from 'core/usecase/user.command';

export const UserRoute = (userCommand: UserUsecaseCommand) => {
  const taskRoute = express.Router();
  taskRoute.post('/', async (req, res) => {
    const name = req.body.name;
    const result = await userCommand.createAnUser({ name })();
    pipe(
      result,
      Either.match(
        (error) => {
          console.log('error occurence ', error);
          res.status(400).send({ detail: error.message });
        },
        (userCreateDTO) =>
          res.status(200).send({
            userId: userCreateDTO.userId,
          }),
      ),
    );
  });
  return taskRoute;
};
