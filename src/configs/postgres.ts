import logger from './logger';
import { postgresConfig } from './vars';
import { Pool } from 'pg';
import Container, { Token } from 'typedi';

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
  host: postgresConfig.host,
  port: +postgresConfig.port,
  user: postgresConfig.user,
  password: postgresConfig.password,
  database: postgresConfig.database,
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
