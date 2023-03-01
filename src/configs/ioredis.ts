import IORedis from 'ioredis';
import Container, { Token } from 'typedi';

export const ioRedisToken = new Token<IORedis>('_ioRedis');

const port = +process.env.REDIS_PORT;
const host = process.env.REDIS_HOST;

const ioRedis = async () => {
  try {
    const connection = new IORedis({
      host,
      port, 
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true
    });
    Container.set(ioRedisToken, connection);

    console.log('init IORedis!');
  } catch (err) {
    console.error('IORedis error', err);
  }
};

export default ioRedis;
