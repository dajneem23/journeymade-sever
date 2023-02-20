import logger from '@/configs/logger';
import { pgPoolToken } from '@/configs/postgres';
import Container from 'typedi';

export const getNansenTransactions = async ({ offset, limit }) => {
  const pgPool = Container.get(pgPoolToken);
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT *
      FROM "bot-nansen-transaction"
      ORDER BY date DESC
      OFFSET ${offset}
      LIMIT ${limit}
      `,
    );
    result = rows;
  } catch (error) {
    logger.error(
      'error',
      '[getPortfolioBalances:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};
