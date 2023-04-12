import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import PriceController from '../controllers/price';
import middleware from '../middleware';

const route = Router();
const { apiCache } = middleware;

export default (app: Router) => {
  app.use('/prices', route);

  const controller = Container.get(PriceController);

  route.get(
    '/:tokenId',
    [
      celebrate({
        params: Joi.object({
          tokenId: Joi.string().required().max(120),
        }),
        query: Joi.object({
          to_time: Joi.number(),
          period: Joi.string().min(2).max(3),
          page: Joi.number(),
          limit: Joi.number(),
        }),
      }),
      apiCache()
    ],    
    controller.getList,
  );

  // route.post(
  //   '/:symbol',
  //   celebrate({
  //     params: Joi.object({
  //       symbol: Joi.string().required(),
  //     }),
  //     body: Joi.object({
  //       prices: Joi.array().required().items({
  //         symbol: Joi.string().required(),
  //         price: Joi.number().required(),
  //         time_at: Joi.number().required(),
  //         volume: Joi.number(),
  //       }),
  //     }),
  //   }),
  //   controller.add,
  // );
};
