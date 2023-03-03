import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

export const getCoinList = async () => {
  const pgPool = Container.get(pgPoolToken);

  let result = [];
  try {
    const { rows } = await pgPool.query(`SELECT symbol FROM "debank-coins"`);
    result = rows.map((row) => row.symbol);
  } catch (error) {
    logger.error('error', '[getCoinList:error]', JSON.stringify(error));
    throw error;
  }

  logger.log('1', `getCoinList: ${result.length}`);

  return result;
};
