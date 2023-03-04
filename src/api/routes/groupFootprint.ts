import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import GroupFootprintController from '../controllers/groupFootprint';

const route = Router();

export default (app: Router) => {
  app.use('/groups/footprints', route);

  const controller = Container.get(GroupFootprintController);

  route.get('/', controller.getList);

  route.post(
    '/',
    celebrate({
      body: Joi.object({
        footprints: Joi.array().required().items({
          gid: Joi.string().required(),
          token: Joi.string().required(),
          amount: Joi.number().required(),
          min_price: Joi.number().required(),
          max_price: Joi.number().required(),
          from_time: Joi.number().required(),
          to_time: Joi.number().required(),
          type: Joi.string().required(),
        }),
      }),
    }),
    controller.add,
  );
};
