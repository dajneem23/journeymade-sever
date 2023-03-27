import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import TransactionController from '../controllers/transaction';

const route = Router();

export default (app: Router) => {
  app.use('/transactions', route);

  const controller = Container.get(TransactionController);

  route.get(
    '/',
    celebrate({
      query: Joi.object({
        token_id: Joi.string(),
        token_symbol: Joi.string(),
        addresses: Joi.string().required(),
        from_time: Joi.number().required(),
        to_time: Joi.number().required(),
        page: Joi.number(),
        limit: Joi.number(),
      }),
    }),
    controller.getList,
  );  

  // route.post(
  //   '/',
  //   celebrate({
  //     body: Joi.object({
  //       transactions: Joi.array().required(),
  //     }),
  //   }),
  //   controller.add,
  // );

  // route.delete(
  //   '/',
  //   celebrate({
  //     body: Joi.object({
  //       id: Joi.string().required(),
  //     }),
  //   }),
  //   controller.delete,
  // );


  /**
   * Tx event
   */
  route.get(
    '/event/stats',
    celebrate({
      query: Joi.object({
        period: Joi.string().min(2).max(3),
        page: Joi.number(),
        limit: Joi.number().min(1).max(5),
      }),
    }),
    controller.getStats,
  );

  route.get(
    '/event/blocks',
    controller.getEventBlocks,
  );
};
