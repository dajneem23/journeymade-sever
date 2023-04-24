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
import behavior from './routes/behavior';
import metric from './routes/metric';
import cache from './routes/cache';
import admin from './routes/admin';

export default () => {
  const app = Router();
  base(app);
  cache(app);
  token(app);
  price(app);
  transaction(app);
  metric(app);
  signal(app);

  tag(app);
  account(app);
  group(app);
  groupFootprint(app);
  behavior(app);
  admin(app);

  return app;
};
