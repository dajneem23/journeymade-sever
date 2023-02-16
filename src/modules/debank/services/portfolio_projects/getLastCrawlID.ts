import logger from '@/configs/logger';
import { pgPoolToken } from '@/configs/postgres';
import Container from 'typedi';

const pgPool = Container.get(pgPoolToken);

export const getProjectsCrawlId = async () => {
  let result;
  try {
    const { rows } = await pgPool.query(
      `
      SELECT crawl_id, min(crawl_time) as min_crawl_time, max(crawl_time) as max_crawl_time, count(*) 
      FROM "debank-portfolio-projects"
      GROUP BY crawl_id
      ORDER BY crawl_id desc
      `,
    );
    result = rows;
  } catch (error) {
    logger.error('error', '[getProjectsCrawlId:error]', JSON.stringify(error));
    throw error;
  }

  return result;
}