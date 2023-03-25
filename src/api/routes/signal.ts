import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import SignalController from '../controllers/signal';

const route = Router();

export default (app: Router) => {
  app.use('/signals', route);

  // route.get('/list', list);
  // route.post('/add', add);

  const controller = Container.get(SignalController);

  route.get(
    '/24h-usd-value',
    celebrate({
      query: Joi.object({
        min_usd_value: Joi.number(),
        symbol: Joi.string(),
        tags: Joi.string(),
        page: Joi.number(),
        limit: Joi.number(),
      }),
    }),
    controller.getLast24hHighUsdValueTxEvent,
  );
};
