import validate, { Joi, Segments } from '@/core/validation';

export const TravelValidation = {
  ask: validate({
    [Segments.BODY]: Joi.object({
      destination: Joi.string().required(),
      people: Joi.number().required(),
      interests: Joi.string().required(),
      duration: [Joi.string().required(), Joi.number().required()],
      start_date: [Joi.string().required(), Joi.date().required()],
      end_date: [Joi.string().required(), Joi.date().required()],
      budget: Joi.string().allow(''),
      transportation: Joi.string().valid('FLIGHT', 'TRAIN', 'BUS', 'CAR'),
    }),
  }),
};
