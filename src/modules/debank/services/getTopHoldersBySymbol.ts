import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

const pgPool = Container.get(pgPoolToken);

export const getTopHoldersBySymbol = async ({
  symbol = '',
  offset = 0,
  limit = 50,
  crawl_id = 0
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT user_address,
        symbol,
        crawl_id,
        crawl_time::text,
        updated_at::text,
        (details -> 'amount')::bigint AS amount
      FROM PUBLIC."debank-top-holders"
      WHERE symbol = '${symbol}'
      AND crawl_id = ${crawl_id}
      ORDER BY (details -> 'amount')::bigint DESC
      OFFSET ${offset}
      LIMIT ${limit}
      `
    );
    result = rows;

  } catch (error) {
    logger.error(
      'error',
      '[getTopHoldersBySymbol:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};

