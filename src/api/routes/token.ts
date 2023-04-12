import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import TokenController from '../controllers/token';
import middleware from '../middleware';

const route = Router();
const { apiCache } = middleware;

export default (app: Router) => {
  app.use('/tokens', route);

  const controller = Container.get(TokenController);

  route.get(
    '/',
    [
      apiCache({
        duration: '60 minutes'
      }),
      celebrate({
        query: Joi.object({
          symbols: Joi.string(),
          limit: Joi.number(),
          page: Joi.number(),
        }),
      }),
    ],
    controller.getList,
  );

  route.get(
    '/:id',
    [     
      celebrate({
        params: Joi.object({
          id: Joi.string().required().max(120),
        }),
      }),
      apiCache({
        duration: '15 minutes'
      }),
    ],
    controller.getById,
  );

  route.get(
    '/:id/volume',
    [
      celebrate({
        params: Joi.object({
          id: Joi.string().required().max(120),
        }),
        query: Joi.object({
          to_time: Joi.number(),
          period: Joi.string().min(2).max(3),
          limit: Joi.number().max(50),
          page: Joi.number(),
        }),
      }),
      apiCache(),
    ],
    controller.getVolume,
  );

  route.get('/:id/holder-stats', controller.getHolderStats);

  route.get(
    '/:id/signals',
    celebrate({
      params: Joi.object({
        id: Joi.string().required().max(120),
      }),
      query: Joi.object({
        to_time: Joi.number(),
        period: Joi.string().min(2).max(3),
        limit: Joi.number(),
        page: Joi.number(),
      }),
    }),
    controller.getSignals,
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
