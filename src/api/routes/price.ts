import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { getPriceList } from '../controllers/price/index';
import middleware from '../middleware';
import validateTokenId from '../middleware/validateTokenId';

const route = Router();
const { apiCache } = middleware;

export default (app: Router) => {
  app.use('/prices', route);

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
      validateTokenId.fromReqParams,
      apiCache({
        duration: '5 minutes',
      })
    ],    
    getPriceList,
  );
};
