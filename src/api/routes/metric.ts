import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { getActivityTrendScore, getVolume } from '../controllers/metric';
import middleware from '../middleware';

const route = Router();
const { apiCache, validateTokenId } = middleware;

export default (app: Router) => {
  app.use('/metrics', route);

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
          limit: Joi.number().max(50),
          page: Joi.number(),
        }),
      }),
      validateTokenId.fromReqParams,
      apiCache({
        duration: '60 minutes',
      }),
    ],
    getVolume,
  );

  route.get(
    '/activity-trend-score/:tokenId',
    [
      celebrate({
        params: Joi.object({
          tokenId: Joi.string().required().max(120),
        }),
        query: Joi.object({
          from_time: Joi.number(),
          to_time: Joi.number(),
          period: Joi.string().min(2).max(3),
          page: Joi.number(),
          limit: Joi.number(),
        }),
      }),
      validateTokenId.fromReqParams,
      apiCache({
        duration: '10 minutes',
      }),
    ],
    getActivityTrendScore
  )
};
