import * as TE from 'fp-ts/TaskEither';

export const TransactionStart = () => () =>
  TE.tryCatch(
    async () => {
      console.log('transaction start');
    },
    (e) => e as Error,
  );
