import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import PriceController from '../controllers/price';

const route = Router();

export default (app: Router) => {
  app.use('/prices', route);

  const controller = Container.get(PriceController);

  route.get(
    '/:symbol',
    celebrate({
      params: Joi.object({
        symbol: Joi.string().required(),
      }),
      query: Joi.object({
        from_time: Joi.number().required(),
        to_time: Joi.number().required(),
        page: Joi.number(),
        limit: Joi.number(),
      }),
    }),
    controller.getList,
  );

  route.post(
    '/:symbol',
    celebrate({
      params: Joi.object({
        symbol: Joi.string().required(),
      }),
      body: Joi.object({
        prices: Joi.array().required().items({
          symbol: Joi.string().required(),
          price: Joi.number().required(),
          time_at: Joi.number().required(),
          volume: Joi.number(),
        }),
      }),
    }),
    controller.add,
  );
};