import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { stringifyObjectMsg } from '@/core/utils';
import cronLog from '@/modules/cron_logs';
import schedule from 'node-schedule';
import Container from 'typedi';
import { CronLog } from '../cron_logs/types';
import {
  countPortfolioBalancesByCrawlId,
  getPortfolioBalancesByCrawlId,
} from '../debank/services';
import { countDocuments } from './services/countDocuments';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, CRON_TASK, DATA_SOURCE } from './types';
import {
  cleanAmount,
  cleanPrice,
  crawlIdAlias,
  prepareCronJobs,
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

const triggerCronJobs = async (forced_crawl_id?) => {
  const telegramBot = Container.get(telegramBotToken);

  const cronJobs = await prepareCronJobs({
    countFn: countPortfolioBalancesByCrawlId,
    forced_crawl_id,
  });

  await Promise.all(
    cronJobs.map(async ({ crawl_id, raw_count, jobs }) => {
      const queueName = `${CRON_TASK.balances}:${crawl_id}`;
      const { queue, addJobs } = CronQueue({
        name: queueName,
        job_handler: async ({ data }) => {
          return await savePortfolioBalances(data);
        },
        drained_callback: async () => {
          const counts = await queue.getJobCounts(
            'active',
            'completed',
            'failed',
            'wait',
          );
          const resultCount = await countDocuments({
            crawl_id,
            filter: {
              pool_id: null,
            },
          });

          cronLog.save([
            <CronLog>{
              job_name: CRON_TASK.balances,
              crawl_id,
              data: {
                raw_count,
                result_count: resultCount,
              },
              job_status: counts,
            },
          ]);

          const msg = `${queueName}: queue drained ${stringifyObjectMsg(
            counts,
          )}`;
          telegramBot.sendMessage(msg);
          console.log(msg);
        },
      });

      cronLog.save([
        <CronLog>{
          job_name: CRON_TASK.balances,
          crawl_id,
          data: {
            raw_count,
          },
          job_count: jobs.length,
        },
      ]);

      await addJobs(jobs);

      const msg = `🚀 ${queueName} init: \n- jobs: ${jobs.length}`;
      console.log(msg);
      telegramBot.sendMessage(msg);
    }),
  );
};

const scheduleCronJobs = () => {
  schedule.scheduleJob('*/20 * * * *', async function () {
    await triggerCronJobs();
  });
};

export default {
  triggerCronJobs,
  scheduleCronJobs,
};
