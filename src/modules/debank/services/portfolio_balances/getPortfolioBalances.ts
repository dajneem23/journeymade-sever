import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

const pgPool = Container.get(pgPoolToken);

export const getPortfolioBalances = async ({
  symbol = '',
  user_addresses = [],
  min_crawl_time,
  max_crawl_time,
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT user_address, updated_at, is_stable_coin, amount, chain, price, crawl_id, crawl_time, symbol
      FROM "debank-user-asset-portfolio-balances"
      WHERE crawl_time >= '${min_crawl_time}'::timestamp       
      AND crawl_time < '${max_crawl_time}'::timestamp       
      AND SYMBOL = '${symbol}'
      AND user_address in (${user_addresses.map((a) => `'${a}'`).join(',')})
      ORDER BY crawl_time DESC
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

export const countPortfolioBalancesBySymbolCrawlId = async ({
  symbol,
  crawl_id,
}) => {
  let result = 0;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT count(*) as count
      FROM "debank-user-asset-portfolio-balances"
      WHERE crawl_id = ${crawl_id}
      AND SYMBOL = '${symbol}'
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

export const getPortfolioBalancesBySymbolCrawlId = async ({
  symbol,
  crawl_id,
  limit = 10,
  offset = 0,
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT user_address, updated_at, is_stable_coin, amount, chain, price, crawl_id, crawl_time, symbol
      FROM "debank-user-asset-portfolio-balances"
      WHERE crawl_id = ${crawl_id}
      AND SYMBOL = '${symbol}'
      ORDER BY updated_at DESC
      OFFSET ${offset}
      LIMIT ${limit}
      `,
    );
    result = rows;
  } catch (error) {
    logger.error(
      'error',
      '[getPortfolioBalancesBySymbolCrawlId:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};
