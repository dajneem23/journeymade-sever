import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';
import TagController from '../controllers/tag';

const route = Router();

export default (app: Router) => {
  app.use('/tags', route);

  // route.get('/list', list);
  // route.post('/add', add);

  const controller = Container.get(TagController);

  route.get(
    '/',
    celebrate({
      query: Joi.object({
        ids: Joi.string(),
        page: Joi.number(),
        limit: Joi.number(),
      }),
    }),
    controller.getList,
  );

  route.post(
    '/',
    celebrate({
      body: Joi.object({
        tags: Joi.array().required().items({
          id: Joi.string().required(),
          name: Joi.string().required(),
          description: Joi.string(),
          source: Joi.string(),
          volume: Joi.number(),
        }),
      }),
    }),
    controller.add,
  );

  route.delete(
    '/',
    celebrate({
      body: Joi.object({
        id: Joi.string().required(),
      }),
    }),
    controller.delete,
  );
};
