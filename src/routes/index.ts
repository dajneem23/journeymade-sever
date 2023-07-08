import express from 'express';

import base from '../routes/base';
import { attachControllers } from '@/utils/expressDecorators';
import TravelController from '@/controllers/travel/travel.controller';
import { Router } from 'express';
import config from '@/config';

export default ({ app }: { app: express.Application }) => {
  const router = Router();

  base(app);

  app.use(`${config.api.prefix}/${config.api.version}`, router);

  attachControllers(router, [TravelController]);
  return router;
};
