import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import BehaviorController from '../controllers/behavior';
import middleware from '../middleware';

const route = Router();
const { apiCache } = middleware;

export default (app: Router) => {
  app.use('/behavior', route);

  const controller = Container.get(BehaviorController);

  route.get(
    '/:tokenId',
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
      apiCache(),
    ],
    controller.getByTokenId,
  );  

  route.get(
    '/:tokenId/logs',
    [
      celebrate({
        params: Joi.object({
          tokenId: Joi.string().required().max(120),
        }),
        query: Joi.object({
          page: Joi.number(),
          limit: Joi.number(),
        }),
      }),
      apiCache({
        duration: '1 minutes'
      }),
    ],    
    controller.getLogs,
  );  

  route.get(
    '/:tokenId/activity-trend-score',
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
      apiCache(),
    ],
    controller.getActivityTrendScore
  )
};
