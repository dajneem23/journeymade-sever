import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import paginate from 'express-paginate';
import { errors } from 'celebrate'

import { globalErrHandler } from '@/api/controllers/base';
import AppError from '@/core/appError';
import routes from '@/api';
import config from '@/config';
import swagger from './swagger';
import { TimeFramesLimit } from '@/constants';

export default ({ app }: { app: express.Application }) => {
  // Allow Cross-Origin requests
  app.use(cors());

  // Set security HTTP headers
  app.use(helmet());

  // Some sauce that always add since 2014
  // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
  // Maybe not needed anymore ?
  app.use(require('method-override')());

  // Limit request from the same API
  const limiter = rateLimit({
    max: 100,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too Many Request from this IP, please try again in an hour',
  });
  app.use('/api', limiter);

  // Body parser, reading data from body into req.body
  app.use(
    express.json({
      limit: '15kb',
    }),
  );
  
  // Data sanitization against Nosql query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS(clean user input from malicious HTML code)
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Routes
  app.use(paginate.middleware(TimeFramesLimit, 50));

  // Load API routes
  app.use(`${config.api.prefix}/${config.api.version}`, routes());
  
  // handle undefined Routes
  app.use('*', (req, res, next) => {
    const err = new AppError(404, 'fail', 'undefined route');
    next(err);
  });

  app.use(errors());

  app.use(globalErrHandler);
};
