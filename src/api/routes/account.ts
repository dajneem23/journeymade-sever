import AccountController from '@/api/controllers/account';
import { celebrate, CelebrateError, Joi } from 'celebrate';
import { Router } from 'express';
import Container from 'typedi';

const route = Router();

export default (app: Router) => {
  app.use('/accounts', route);

  const controller = Container.get(AccountController);

  route.get('/', controller.getList);

  route.post(
    '/',
    celebrate({
      body: Joi.object({
        accounts: Joi.array().required().items({
          address: Joi.string().required(),
          tokens: Joi.string(),
          tags: Joi.string(),
          chains: Joi.string(),
        }),
      }),
    }),
    controller.add,
  );

  route.delete(
    '/',
    celebrate({
      body: Joi.object({
        address: Joi.string().required()
      })
    }),
    controller.delete,
  );
};
