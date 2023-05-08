import { Container } from 'typedi';
import { Logger } from 'winston';
import apicache from 'apicache'
import config from '@/config';

/**
 * Attach user to req.currentUser
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const apiCache = async (req, res, next, opts) => {
  const Logger: Logger = Container.get('logger');
  try {    
    let memoryCache = apicache.middleware

    const onlyStatus200 = (req, res) => res.statusCode === 200;
    const duration  = opts.duration || '5 minutes'

    return memoryCache(duration, onlyStatus200)(req, res, next);
  } catch (e) {
    Logger.error('🔥 Error attaching user to req: %o', e);
    return next(e);
  }
};

const cacheOptions = (opts?) => {
  let duration = opts?.duration;

  return async (req, res, next) => {
    if (!config.isProduction) return next();
    
    if (!duration && req?.query?.period) {
      const period: string = req.query.period;
      if (period.toLowerCase().includes("h")) {
        duration = "2 minutes"
      } else if (period.toLowerCase().includes("d")) {
        duration = "5 minutes"
      }
    }

    return apiCache(req, res, next, { duration })
  }
};

export default cacheOptions;