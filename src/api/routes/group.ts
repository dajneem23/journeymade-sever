import GroupController from '@/api/controllers/group';
import { celebrate, CelebrateError, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';

const route = Router();

export default (app: Router) => {
  app.use('/groups', route);

  const controller = Container.get(GroupController);

  route.get('/', controller.getList);

  route.post(
    '/',
    celebrate({
      body: Joi.object({
        groups: Joi.array().required().items({
          id: Joi.string().required(),
          name: Joi.string().required(),
          description: Joi.string(),
          token: Joi.string(),
          tags: Joi.string().required(),
          members: Joi.array().required().min(1).items(Joi.string()),
        }),
      }),
    }),
    controller.add,
  );

  route.delete(
    '/',
    celebrate({
      body: Joi.object({
        id: Joi.string().required()
      })
    }),
    controller.delete,
  );
};
