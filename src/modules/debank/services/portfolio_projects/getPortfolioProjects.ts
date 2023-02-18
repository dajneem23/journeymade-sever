import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';
import { maxUSDValue, minUSDValue } from '@/configs/vars';


export const countPortfolioProjectsByCrawlId = async ({
  crawl_id,
}) => {
  const pgPool = Container.get(pgPoolToken);
  let result = 0;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT count(*) as count
      FROM "debank-portfolio-projects-${crawl_id}"
      WHERE (
        usd_value is null 
        OR (usd_value > ${minUSDValue} AND usd_value < ${maxUSDValue})
      )
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
  const pgPool = Container.get(pgPoolToken);
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT *
      FROM "debank-portfolio-projects-${crawl_id}"
      WHERE (
        usd_value is null 
        OR (usd_value > ${minUSDValue} AND usd_value < ${maxUSDValue})
      )
      ORDER BY usd_value DESC
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
