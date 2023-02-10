import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

const pgPool = Container.get(pgPoolToken);

export const getPortfolioByUserAddress = async ({
  symbol = '',
  user_addresses = [],
  min_crawl_time,
  max_crawl_time
}) => {
  // console.log("🚀 ~ file: getPortfolioByUserAddress.ts:13 ~ min_crawl_time", min_crawl_time, typeof min_crawl_time)
  // console.log("🚀 ~ file: getPortfolioByUserAddress.ts:13 ~ max_crawl_time", max_crawl_time, typeof max_crawl_time)
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT user_address, updated_at, is_stable_coin, amount, chain, price, crawl_id, crawl_time, symbol
      FROM "debank-user-asset-portfolio-balances"
      WHERE crawl_time >= '${min_crawl_time}'::timestamp       
      AND crawl_time < '${max_crawl_time}'::timestamp       
      AND SYMBOL = '${symbol}'
      AND user_address in (${user_addresses.map(a => `'${a}'`).join(',')})
      ORDER BY crawl_time DESC
      `
    );
    result = rows;

  } catch (error) {
    logger.error(
      'error',
      '[getPortfolioByUserAddress:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};

