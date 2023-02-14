import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

const pgPool = Container.get(pgPoolToken);

export const countPortfolioProjectsByCrawlId = async ({
  crawl_id,
}) => {
  let result = 0;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT count(*) as count
      FROM "debank-user-asset-portfolio-projects"
      WHERE crawl_id = ${crawl_id}
      `,
    );
    result = rows[0]?.count;
  } catch (error) {
    logger.error(
      'error',
      '[countPortfolioBalancesBySymbolCrawlId:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return Number(result);
};

export const getPortfolioProjectsByCrawlId = async ({
  crawl_id,
  limit = 10,
  offset = 0,
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT *
      FROM "debank-user-asset-portfolio-projects"
      WHERE crawl_id = ${crawl_id}
      ORDER BY crawl_time DESC
      OFFSET ${offset}
      LIMIT ${limit}
      `,
    );
    result = rows;
  } catch (error) {
    logger.error(
      'error',
      '[getPortfolioProjectsBySymbolCrawlId:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};
