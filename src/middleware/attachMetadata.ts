import LoggerService from '@/services/logger/logger.service';
import { Container } from 'typedi';
import { Logger } from 'winston';

export type Metadata = {};

const attachMetadata = async (req, res, next) => {
  const Logger: LoggerService = Container.get(LoggerService);
  try {
    req.metadata = {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    };
    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

export default attachMetadata;
