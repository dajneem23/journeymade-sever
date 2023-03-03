import schedule from 'node-schedule';
import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { stringifyObjectMsg } from '@/core/utils';
import { getCoinList } from '@/modules/_temp/debank/services';
import cronLog from '@/modules/_temp/cron_logs';
import Container from 'typedi';
import { saveTopHoldersStatistics } from '../services/saveTopHoldersStatistics';
import saveLogs from '../__temp/top_holders/saveLogs';
import { EnumTopHolders } from '../types/enum.type';
import TopHolders from './TopHolders';

function segmentList() {
  const result = [];
  for (const [key, value] of Object.entries(EnumTopHolders)) {
    const offset = +value.split(':')[1].split('-')[0];
    const limit = +value.split(':')[1].split('-')[1] - offset;
    result.push({ key, offset, limit });
  }

  return result;
}

async function jobHandler({ id, symbol, offset, limit, crawl_id }) {
  const group = new TopHolders(id, {
    crawl_id,
    offset,
    limit,
    symbol,
  });

  const value = await group.process();

  if (value) await saveTopHoldersStatistics(value);
}

async function createCronQueue(cid, jobs) {
  const telegramBot = Container.get(telegramBotToken);
  const queueName = `top-holders:${cid}`;

  const { queue, addJobs } = await CronQueue({
    name: queueName,
    job_handler: async ({ data }) => {
      return await jobHandler(data);
    },
    drained_callback: async () => {
      setTimeout(async () => {
        const { jobCounts, resultCount } = await saveLogs({
          queue,
          crawl_id: cid,
          raw_count: null,
          job_count: jobs.length,
        });

        const msg = `${queue.name}: queue drained ${stringifyObjectMsg({
          num_of_jobs: jobs.length,
          job_queue_status: jobCounts,
          pg_raw: null,
          mongo_updated: resultCount,
        })}`;
        telegramBot.sendMessage(msg);
        console.log(msg);
      }, 60000);
    },
    job_options: {
      // The total number of attempts to try the job until it completes
      attempts: 3,
      // Backoff setting for automatic retries if the job fails
      backoff: { type: 'fixed', delay: 10 * 1000 },
      removeOnComplete: {
        age: 60 * 60, // 1h
      },
      removeOnFail: true,
    },
  });

  addJobs(jobs);

  return queue;
}

export const triggerCronJobs = async (forced_crawl_id?) => {
  const telegramBot = Container.get(telegramBotToken);
  const symbols = await getCoinList();

  const rawLogs = await cronLog.get();
  const crawlIdOptions = Array.from(new Set(rawLogs.map((l) => l.crawl_id)));
  let crawlIds = crawlIdOptions.slice(0, 1);

  if (forced_crawl_id) {
    crawlIds = [+forced_crawl_id];
  }

  await Promise.all(
    crawlIds.map(async (cid) => {
      const jobs = [];
      const segments = segmentList();
      symbols.forEach((symbol) => {
        segments.forEach((segment) => {
          jobs.push({
            id: `${cid}:${symbol.toLowerCase()}:${segment.key}`,
            symbol,
            offset: segment.offset,
            limit: segment.limit,
            crawl_id: cid,
          });
        });
      });

      const queue = await createCronQueue(cid, jobs);
      const { jobCounts, resultCount } = await saveLogs({
        queue,
        crawl_id: cid,
        raw_count: null,
        job_count: jobs.length,
      });

      const msg = `🚀 ${queue.name} init: ${stringifyObjectMsg({
        num_of_jobs: jobs.length,
        job_queue_status: jobCounts,
        pg_raw: null,
        mongo_updated: resultCount,
      })}`;
      console.log(msg);
      telegramBot.sendMessage(msg);
    }),
  );
};

export const scheduleCronJobs = () => {
  schedule.scheduleJob('*/30 * * * *', async function () {
    await triggerCronJobs();
  });
};
