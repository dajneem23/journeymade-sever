import { Router } from 'express';

import account from './routes/account';
import base from './routes/base';
import price from './routes/price';
import tag from './routes/tag';
import token from './routes/token';
import transaction from './routes/transaction';
import group from './routes/group';
import groupFootprint from './routes/groupFootprint';
import signal from './routes/signal';

export default () => {
  const app = Router();
  tag(app);
  token(app);
  transaction(app);
  account(app);
  price(app);
  base(app);
  group(app);
  groupFootprint(app);
  signal(app);

  return app;
};
