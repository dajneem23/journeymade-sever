import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import TokenController from '../controllers/token';
import {
  addToken,
  getHolderStats,
  getTokenDetails,
  getTokenList,
} from '../controllers/token/index';
import middleware from '../middleware';
import isAuth from '../middleware/isAuth';

const route = Router();
const { apiCache } = middleware;

export default (app: Router) => {
  app.use('/tokens', route);

  const controller = Container.get(TokenController);

  route.get(
    '/',
    [
      celebrate({
        query: Joi.object({
          symbols: Joi.string(),
          limit: Joi.number(),
          page: Joi.number(),
        }),
      }),
      apiCache({
        duration: '60 minutes',
      }),
    ],
    getTokenList,
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
        duration: '15 minutes',
      }),
    ],
    getTokenDetails,
  );

  route.get(
    '/:id/holder-stats',
    [
      apiCache({
        duration: '15 minutes',
      }),
    ],
    getHolderStats,
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
      apiCache(), // TODO
    ],
    controller.getVolume,
  );

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

  route.post(
    '/',
    [
      celebrate({
        body: Joi.object({
          tokens: Joi.array()
            .items({
              id: Joi.string().required(),
              name: Joi.string().required(),
              symbol: Joi.string().required(),
              decimals: Joi.number().required(),
              address: Joi.string().required(),
              chainId: Joi.number().required(),
              logoURI: Joi.string().required(),
              coingeckoId: Joi.string().required(),
              listedIn: Joi.array().required(),
            })
            .required(),
        }),
      }),
    ],
    addToken as any,
  );

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
