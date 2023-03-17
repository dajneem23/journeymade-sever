import IORedis from 'ioredis';
import Container, { Token } from 'typedi';
import config from '@/config';
import logger from './logger';

export const ioRedisToken = new Token<IORedis>('_ioRedis');

const ioRedis = async () => {
  try {
    const connection = new IORedis(config.redis.uri, {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    Container.set(ioRedisToken, connection);

    logger.info('init IORedis!');
  } catch (err) {
    logger.error('IORedis error', err);
  }
};

export default ioRedis;
