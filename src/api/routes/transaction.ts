import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { getLogsByTxHash, getTokenTxLogs } from '../controllers/transaction/index';
import validateTokenId from '../middleware/validateTokenId';

const route = Router();

export default (app: Router) => {
  app.use('/transactions', route);

  route.get(
    '/logs/:tokenId',
    [
      celebrate({
        params: Joi.object({
          tokenId: Joi.string().required().max(120),
        }),
        query: Joi.object({
          from_time: Joi.number(),
          to_time: Joi.number(),
          page: Joi.number(),
          limit: Joi.number(),
        }),
      }),
      validateTokenId.fromReqParams,
    ],
    getTokenTxLogs,
  );

  route.get(
    '/:hash/logs',
    celebrate({
      params: Joi.object({
        hash: Joi.string().required(),
      }),
    }),
    getLogsByTxHash,
  );

  // /**
  //  * Tx event
  //  */
  // route.get(
  //   '/event/stats',
  //   celebrate({
  //     query: Joi.object({
  //       period: Joi.string().min(2).max(3),
  //       page: Joi.number(),
  //       limit: Joi.number().default(5),
  //     }),
  //   }),
  //   controller.getEventStats,
  // );

  // route.get('/event/blocks', controller.getEventBlocks);
};
