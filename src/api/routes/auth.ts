import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { getVolume } from '../controllers/metric';
import middleware from '../middleware';

const route = Router();
const { apiCache, validateTokenId } = middleware;

export default (app: Router) => {
  app.use('/admin', route);

  route.post(
    '/signin',
    [
      celebrate({
        query: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      }),
    ],
    getVolume,
  );
};
