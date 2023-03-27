import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import TokenController from '../controllers/token';

const route = Router();

export default (app: Router) => {
  app.use('/tokens', route);

  const controller = Container.get(TokenController);

  route.get(
    '/',
    celebrate({
      query: Joi.object({
        symbols: Joi.string(),
        limit: Joi.number(),
        page: Joi.number(),
      }),
    }),
    controller.getList,
  );

  route.get(
    '/:name/volume',
    celebrate({
      query: Joi.object({
        period: Joi.string().min(2).max(3),
        limit: Joi.number(),
        page: Joi.number(),
      }),
    }),
    controller.getVolume,
  );

  // route.post(
  //   '/',
  //   celebrate({
  //     body: Joi.object({
  //       tokens: Joi.array().required().items({
  //         symbol: Joi.string().required(),
  //         name: Joi.string().required(),
  //         contract_ids: Joi.object().required(),
  //       })
  //     }),
  //   }),
  //   controller.add,
  // );

  // route.delete(
  //   '/',
  //   celebrate({
  //     body: Joi.object({
  //       symbol: Joi.string().required(),
  //     }),
  //   }),
  //   controller.delete,
  // );
};
