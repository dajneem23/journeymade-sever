import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { volumeSignal } from '../controllers/signal/index';
import apiCache from '../middleware/apiCache';
import validateTokenId from '../middleware/validateTokenId';

const route = Router();

export default (app: Router) => {
  app.use('/signals', route);

  route.get(
    '/volume/:tokenId',
    [
      celebrate({
        params: Joi.object({
          tokenId: Joi.string().required().max(120),
        }),
        query: Joi.object({
          to_time: Joi.number(),
          period: Joi.string().min(2).max(3),
          page: Joi.number(),
          limit: Joi.number(),
        }),
      }),
      validateTokenId.fromReqParams,
      apiCache({
        duration: '5 minutes',
      }),
    ],
    volumeSignal,
  );

  // route.post('/add', add);

  // const controller = Container.get(SignalController);

  // route.get(
  //   '/24h-usd-value',
  //   celebrate({
  //     query: Joi.object({
  //       min_usd_value: Joi.number(),
  //       symbol: Joi.string(),
  //       tags: Joi.string(),
  //       page: Joi.number(),
  //       limit: Joi.number(),
  //     }),
  //   }),
  //   controller.getLast24hHighUsdValueTxEvent,
  // );
};
