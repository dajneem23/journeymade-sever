import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import BehaviorController from '../controllers/behavior';

const route = Router();

export default (app: Router) => {
  app.use('/behavior', route);

  const controller = Container.get(BehaviorController);

  route.get(
    '/:tokenId',
    celebrate({
      query: Joi.object({
        from_time: Joi.number(),
        to_time: Joi.number(),
        period: Joi.string().min(2).max(3),
        page: Joi.number(),
        limit: Joi.number(),
      }),
    }),
    controller.getByTokenId,
  );  
};
