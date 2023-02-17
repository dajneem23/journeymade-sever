import logger from '@/configs/logger';
import { pgPoolToken } from '@/configs/postgres';
import { minUSDValue } from '@/configs/vars';
import Container from 'typedi';

export const getLastCrawlID = async () => {
  const pgPool = Container.get(pgPoolToken);

  let result;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT max(crawl_id)
      FROM "debank-user-asset-portfolio-balances"
      `,
    );
    result = rows[0]?.max;
  } catch (error) {
    logger.error('error', '[getLastCrawlID:error]', JSON.stringify(error));
    throw error;
  }

  return result;
};