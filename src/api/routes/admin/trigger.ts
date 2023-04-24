import { celebrate, Joi } from 'celebrate';
import { Router } from 'express';
import { getActivityTrendScore, getVolume } from '../../controllers/metric';
import middleware from '../../middleware';
import { addTxEventJobs } from '@/api/controllers/admin';

const route = Router();
const { apiCache, validateTokenId } = middleware;

export default (app: Router) => {
  app.use('/trigger', route);

  route.post(
    '/tx-event-job',
    [
      celebrate({
        body: Joi.object({
          filter: Joi.object({
            token_id: Joi.string().required(),
            from_time: Joi.number().required(),
          }),
          opts: {
            force_all: Joi.boolean().default(false),
            limit: Joi.number().default(2000),
          }
        })
      }),
    ],
    addTxEventJobs as any,
  );
};
