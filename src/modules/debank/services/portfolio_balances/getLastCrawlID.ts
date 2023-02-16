import logger from '@/configs/logger';
import { pgPoolToken } from '@/configs/postgres';
import Container from 'typedi';

const pgPool = Container.get(pgPoolToken);

export const getLastCrawlID = async () => {
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

export const getBalancesCrawlId = async () => {
  let result;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT crawl_id, min(crawl_time) as min_crawl_time, max(crawl_time) as max_crawl_time, count(*)
      FROM "debank-portfolio-balances"
      GROUP BY crawl_id
      ORDER BY crawl_id desc
      `,
    );
    result = rows;
  } catch (error) {
    logger.error('error', '[getBalancesCrawlId:error]', JSON.stringify(error));
    throw error;
  }

  return result;
}