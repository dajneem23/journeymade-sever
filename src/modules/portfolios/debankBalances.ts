import { CronQueue } from '@/configs/queue';
import { nodeEnv } from '@/configs/vars';
import schedule from 'node-schedule';
import {
  getBalancesCrawlId,
  getPortfolioBalancesByCrawlId,
} from '../debank/services';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, CRON_TASK, DATA_SOURCE } from './types';
import {
  cleanAmount,
  cleanPrice,
  crawlIdAlias,
  prepareOffsets,
  toTimestamp,
} from './utils';

const getPortfolioBalances = async ({ crawl_id, limit, offset }) => {
  try {
    const balances = await getPortfolioBalancesByCrawlId({
      crawl_id,
      limit,
      offset,
    });

    return balances.map(
      (b) =>
        <AddressSymbolPortfolios>{
          wallet_address: b.user_address as string,
          symbol: b.symbol as string,
          amount: cleanAmount(b.amount),
          price: cleanPrice(b.price),
          usd_value: cleanAmount(b.amount) * cleanPrice(b.price),

          chain: b.chain,
          crawl_time: toTimestamp(b.crawl_time),
          crawl_id: crawlIdAlias(crawl_id),

          dao_id: undefined,
          platform_token_id: undefined,
          pool_id: undefined,
          pool_adapter_id: undefined,

          source: DATA_SOURCE.debank,
        },
    );
  } catch (e) {
    throw new Error(e);
  }
};

const savePortfolioBalances = async ({ crawl_id, offset, limit }) => {
  const portfolios = await getPortfolioBalances({
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

const prepareCronJobs = async () => {
  const defaultLimit = 1000;
  const crawlIds = await getBalancesCrawlId();

  const jobs = crawlIds
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

export const initDebankBalancesJobs = async () => {
  const { addJobs } = CronQueue(CRON_TASK.balances, async ({ data }) => {
    return await savePortfolioBalances(data);
  });

  if (nodeEnv !== 'production') {
    const jobs = await prepareCronJobs();
    console.log('🚀 ~ init', CRON_TASK.balances, jobs.length, new Date());
    await addJobs(jobs);
  } else {
    schedule.scheduleJob('50 */3 * * *', async function () {
      const jobs = await prepareCronJobs();
      console.log('🚀 ~ init', CRON_TASK.balances, jobs.length, new Date());
      await addJobs(jobs);
    });
  }
};
