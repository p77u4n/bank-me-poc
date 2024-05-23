import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { Registry } from 'infra/registry.base';
import { AccRoute } from '../controller/account.controller';
import { UserRoute } from '../controller/user.controller';

export const app = express();
const port = 3003;
app.use(
  cors({
    allowedHeaders: '*',
    origin: '*',
    methods: '*',
  }),
);
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const runExpress = (registry: Registry) => {
  app.use(
    '/account',
    AccRoute(registry.accountCommandHandler, registry.accountQueryHandler),
  );
  app.use('/user', UserRoute(registry.userCommandHandler));
  app.get('/', (req, res) => {
    res.send('Welcome !');
  });
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
