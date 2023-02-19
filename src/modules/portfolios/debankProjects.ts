import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { minUSDValue } from '@/configs/vars';
import { stringifyObjectMsg } from '@/core/utils';
import cronLog from '@/modules/cron_logs';
import schedule from 'node-schedule';
import Container from 'typedi';
import { CronLog } from '../cron_logs/types';
import {
  countPortfolioProjectsByCrawlId,
  getPortfolioProjectsByCrawlId,
} from '../debank/services';
import { setIntervalLimited } from '../statistics/utils';
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
      return portfolio_item_list.forEach((item, idx) =>
        item.asset_token_list?.forEach((t, sidx) => {
          const usdValue = cleanAmount(t.amount) * cleanPrice(t.price);
          if (Math.abs(usdValue) > minUSDValue) {
            results.push(<AddressSymbolPortfolios>{
              wallet_address: user_address,
              symbol: t.symbol,
              amount: cleanAmount(t.amount),
              price: cleanPrice(t.price),
              usd_value: usdValue,

              chain: t.chain,
              crawl_time: toTimestamp(crawl_time),
              crawl_id: crawlIdAlias(crawl_id),
              ref_id: `${t.id}-${idx}`,

              dao_id: dao_id,
              platform_token_id: platform_token_id,
              pool_id: item.pool?.id,
              pool_adapter_id: item.pool?.adapter_id,

              source: DATA_SOURCE.debank,
            });
          }
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
      await savePortfolios(crawl_id, portfolios);
    } catch (e) {
      throw new Error(e);
    }
  }

  return `${crawl_id}: ${offset} - count=${portfolios.length}`;
};

const saveLogs = async ({ queue, raw_count, crawl_id }) => {
  const jobCounts = await queue.getJobCounts(
    'active',
    'completed',
    'failed',
    'wait',
  );
  const resultCount = await countDocuments({
    crawl_id,
    filter: {
      pool_id: { $ne: null },
    },
  });

  cronLog.save([
    <CronLog>{
      job_name: CRON_TASK.projects,
      crawl_id,
      data: {
        raw_count,
        result_count: resultCount,
      },
      job_status: jobCounts,
    },
  ]);

  return {
    jobCounts,
    resultCount,
  };
};

export const triggerCronJobs = async (forced_crawl_id?) => {
  const telegramBot = Container.get(telegramBotToken);

  const cronJobs = await prepareCronJobs({
    countFn: countPortfolioProjectsByCrawlId,
    forced_crawl_id,
  });

  await Promise.all(
    cronJobs.map(async ({ crawl_id, raw_count, jobs }) => {
      const queueName = `${CRON_TASK.projects}:${crawl_id}`;
      const { queue, addJobs } = await CronQueue({
        name: queueName,
        job_handler: async ({ data }) => {
          return await savePortfolioProjects(data);
        },
        drained_callback: async () => {
          setTimeout(async () => {
            const { jobCounts, resultCount } = await saveLogs({
              queue,
              crawl_id,
              raw_count,
            });

            const msg = `${queue.name}: queue drained ${stringifyObjectMsg({
              num_of_jobs: jobs.length,
              job_queue_status: jobCounts,
              pg_raw: raw_count,
              mongo_updated: resultCount,
            })}`;
            telegramBot.sendMessage(msg);
            console.log(msg);

            setIntervalLimited(
              () => {
                queue.getFailed().then(async (jobs) => {
                  return await Promise.all(jobs.map((job) => job.retry()));
                });
              },
              60 * 1000,
              5,
            );
          }, 5000);
        },
      });

      await addJobs(jobs);

      const { jobCounts, resultCount } = await saveLogs({
        queue,
        crawl_id,
        raw_count,
      });

      const msg = `🚀 ${queue.name} init: ${stringifyObjectMsg({
        num_of_jobs: jobs.length,
        job_queue_status: jobCounts,
        pg_raw: raw_count,
        mongo_updated: resultCount,
      })}`;
      console.log(msg);
      telegramBot.sendMessage(msg);
    }),
  );
};

const scheduleCronJobs = () => {
  schedule.scheduleJob('*/30 * * * *', async function () {
    await triggerCronJobs();
  });
};

export default {
  triggerCronJobs,
  scheduleCronJobs,
};
