import logger from '@/configs/logger';
import { pgPoolToken } from '@/configs/postgres';
import Container from 'typedi';

const pgPool = Container.get(pgPoolToken);

export const getTopHoldersTimeFrame = async ({
  symbol = '',
  offset = 0,
  limit = 12,
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
      SELECT crawl_id, MIN(updated_at)::text as from_time, MAX(updated_at)::text as to_time, count(1)::bigint as count
      FROM public."debank-top-holders"
      WHERE symbol = '${symbol}'
      GROUP BY crawl_id
      ORDER BY crawl_id DESC
      OFFSET ${offset}
      LIMIT ${limit}
      `
    );
    result = rows;

  } catch (error) {
    logger.error(
      'error',
      '[getTopHoldersTimeFrame:error]',
      JSON.stringify(error),
    );
    throw error;
  }

  return result;
};

