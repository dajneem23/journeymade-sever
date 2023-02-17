import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { nodeEnv } from '@/configs/vars';
import { stringifyObjectMsg } from '@/core/utils';
import schedule from 'node-schedule';
import Container from 'typedi';
import {
  countPortfolioBalancesByCrawlId,
  getPortfolioBalancesByCrawlId,
} from '../debank/services';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, CRON_TASK, DATA_SOURCE } from './types';
import {
  cleanAmount,
  cleanPrice,
  crawlIdAlias,
  prepareCrawlIds,
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
      await savePortfolios(crawl_id, portfolios);
    } catch (e) {
      throw new Error(e);
    }
  }

  return `${crawl_id}: ${offset} - count=${portfolios.length}`;
};

const prepareCronJobs = async (forced_crawl_id?) => {
  const defaultLimit = 500;
  const crawlIds = prepareCrawlIds();

  let ids = crawlIds;
  if (forced_crawl_id) {
    ids = crawlIds.filter(({ crawl_id }) => crawl_id === forced_crawl_id);
  }

  const jobs = await Promise.all(
    ids
      .map(async ({ crawl_id }) => {
        const count = await countPortfolioBalancesByCrawlId({ crawl_id });
        const offsets = prepareOffsets(count, defaultLimit);
        return offsets.map((offset) => ({
          crawl_id: Number(crawl_id),
          offset,
          limit: defaultLimit,
        }));
      })      
  );

  return jobs.flat();
};

export const initDebankBalancesJobs = async () => {
  const telegramBot = Container.get(telegramBotToken);

  const { queue, addJobs } = CronQueue(CRON_TASK.balances, async ({ data }) => {
    return await savePortfolioBalances(data);
  });

  if (nodeEnv !== 'production') {
    const waitingCount = await queue.getWaitingCount();
    console.log('🚀 ', CRON_TASK.balances, ' ~ waitingCount', waitingCount);

    if (waitingCount === 0) {
      const failedCount = await queue.getFailedCount();

      if (failedCount === 0) {
        const jobs = await prepareCronJobs();
        console.log('🚀 ~ init', CRON_TASK.balances, jobs.length, new Date());
        await addJobs(jobs);
      } else {
        const failedJobs = await queue.getFailed(0, failedCount);
        await addJobs(failedJobs.map((j) => j.data));
      }
    }
  } else {
    schedule.scheduleJob('50 * * * *', async function () {
      const jobs = await prepareCronJobs();
      await addJobs(jobs);

      const counts = await queue.getJobCounts('wait', 'completed', 'failed');
      const msg = `🚀 ~ init': ${CRON_TASK.balances} - ${
        jobs.length
      } ${stringifyObjectMsg(counts)}`;
      telegramBot.sendMessage(msg);
      console.log(msg, new Date());
    });
  }
};

export const triggerCronJob = async (forced_crawl_id) => {
  const telegramBot = Container.get(telegramBotToken);

  const { queue, addJobs } = CronQueue(CRON_TASK.balances, async ({ data }) => {
    return await savePortfolioBalances(data);
  });

  if (forced_crawl_id) {
    const jobs = await prepareCronJobs(forced_crawl_id);
    await addJobs(jobs);

    const counts = await queue.getJobCounts('wait', 'completed', 'failed');
    const msg = `🚀 ~ force init': ${
      CRON_TASK.balances
    } - ${forced_crawl_id}, ${jobs.length} ${stringifyObjectMsg(counts)}`;
    telegramBot.sendMessage(msg);
    console.log(msg, new Date());
  }
};
