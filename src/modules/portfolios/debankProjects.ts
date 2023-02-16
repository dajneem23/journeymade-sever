import { CronQueue } from '@/configs/queue';
import { nodeEnv } from '@/configs/vars';
import schedule from 'node-schedule';
import {
  getPortfolioProjectsByCrawlId
} from '../debank/services';
import { getProjectsCrawlId } from '../debank/services/portfolio_projects/getLastCrawlID';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, CRON_TASK, DATA_SOURCE } from './types';
import {
  cleanAmount,
  cleanPrice,
  crawlIdAlias,
  prepareOffsets,
  toTimestamp
} from './utils';

const getPortfoliosProjects = async ({ crawl_id, limit, offset }) => {
  try {
    const raws = await getPortfolioProjectsByCrawlId({
      crawl_id,
      limit,
      offset,
    });

    const results = [];

    raws.forEach(({ user_address, details, crawl_time, crawl_id }) => {
      const {
        dao_id,
        platform_token_id,
        portfolio_item_list = [],
      } = details || {};
      return portfolio_item_list.forEach((item) =>
        item.asset_token_list?.forEach((t) => {
          results.push(<AddressSymbolPortfolios>{
            wallet_address: user_address,
            symbol: t.symbol,
            amount: cleanAmount(t.amount),
            price: cleanPrice(t.price),
            usd_value: cleanAmount(t.amount) * cleanPrice(t.price),

            chain: t.chain,
            crawl_time: toTimestamp(crawl_time),
            crawl_id: crawlIdAlias(crawl_id),

            dao_id: dao_id,
            platform_token_id: platform_token_id,
            pool_id: item.pool?.id,
            pool_adapter_id: item.pool?.adapter_id,

            source: DATA_SOURCE.debank,
          });
        }),
      );
    });

    return results;
  } catch (e) {
    throw new Error(e);
  }
};

export const savePortfolioProjects = async ({ crawl_id, offset, limit }) => {
  const portfolios = await getPortfoliosProjects({
    crawl_id,
    offset,
    limit,
  });

  if (portfolios?.length > 0) {
    try {
      await savePortfolios(portfolios);
    } catch (e) {
      throw new Error(e);
    }
  }

  return `${crawl_id}: ${offset} - count=${portfolios.length}`;
};

const prepareCronJobs = async (forced_crawl_id?) => {
  const defaultLimit = 500;
  const crawlIds = await getProjectsCrawlId();

  let ids = crawlIds;
  if (forced_crawl_id) {
    ids = crawlIds.filter(({ crawl_id }) => crawl_id == forced_crawl_id);
  }

  const jobs = ids
    .slice(0, 2)
    .map(({ crawl_id, count }) => {
      const offsets = prepareOffsets(Number(count), defaultLimit);
      return offsets.map((offset) => ({
        crawl_id: Number(crawl_id),
        offset,
        limit: defaultLimit,
      }));
    })
    .flat();

  return jobs;
};

export const initDebankProjectsJobs = async (forced_crawl_id?) => {
  const { addJobs } = CronQueue(CRON_TASK.projects, async ({ data }) => {
    return await savePortfolioProjects(data);
  });
  
  if (nodeEnv !== 'production') {
    // const jobs = await prepareCronJobs();    
    // console.log('🚀 ~ init', CRON_TASK.projects, jobs.length, new Date());
    // await addJobs(jobs);
  } else {
    schedule.scheduleJob('50 * * * *', async function () {
      const jobs = await prepareCronJobs();
      console.log('🚀 ~ init', CRON_TASK.projects, jobs.length, new Date());
      await addJobs(jobs);
    });
  }
};

export const triggerCronJob = async (forced_crawl_id) => {
  const { addJobs } = CronQueue(CRON_TASK.projects, async ({ data }) => {
    return await savePortfolioProjects(data);
  });

  if (forced_crawl_id) {
    const jobs = await prepareCronJobs(forced_crawl_id);
    console.log('🚀 ~ force init', CRON_TASK.balances, forced_crawl_id, jobs.length, new Date());
    return await addJobs(jobs);
  }
};
