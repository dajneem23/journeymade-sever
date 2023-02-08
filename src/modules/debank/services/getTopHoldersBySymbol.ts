import Container from 'typedi';
import { pgPoolToken } from '@/configs/postgres';
import logger from '@/configs/logger';

const pgPool = Container.get(pgPoolToken);

export const getTopHoldersBySymbol = async ({
  symbol = '',
  offset = 0,
  limit = 50,
}) => {
  let result = [];
  try {
    const { rows } = await pgPool.query(
      `
        SELECT 
          crawl_id, 
          AVG(amount::bigint) as avg_balance, 
          SUM(amount::bigint) as amount, 
          MAX(updated_at) at time zone 'gmt' at time zone 'ict' as updated_at,
          COUNT(*) as count,
          ARRAY_AGG(user_address) as user_address
        FROM
          ( SELECT user_address, crawl_id, updated_at, crawl_time, amount, ranking 
            FROM 
              ( SELECT *, details -> 'amount' as amount, row_number() over (PARTITION BY crawl_id::text ORDER BY crawl_id DESC, (details -> 'amount')::bigint DESC) as ranking
                FROM public."debank-top-holders"
                WHERE symbol = '${symbol}') rank_filter
            WHERE ranking > ${offset}
            AND ranking <= ${limit}
            ORDER BY amount DESC
          ) top_n
        GROUP BY crawl_id
        ORDER BY crawl_id DESC
      `,
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

