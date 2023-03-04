import { Pool } from 'pg';
import Container, { Token } from 'typedi';
import logger from './logger';
import config from '@/config';

// export const pgClientToken = new Token<Client>('_pgClient');
export const pgPoolToken = new Token<Pool>('_pgPool');

// const client = new Client({
//   host: postgresConfig.host,
//   port: +postgresConfig.port,
//   user: postgresConfig.user,
//   password: postgresConfig.password,
//   database: postgresConfig.database,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

const pgPool = new Pool({
  host: config.postgres.host,
  port: +config.postgres.port,
  user: config.postgres.user,
  password: config.postgres.password,
  database: config.postgres.database,
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
});

const pgLoader = async () => {
  try {
    await pgPool.connect();
    Container.set(pgPoolToken, pgPool);

    logger.info('Pool Postgres Connected!');
  } catch (err) {
    logger.error('pool:connect:pg error', 'pool:connect:pg', err);
  }
};

export default pgLoader;
