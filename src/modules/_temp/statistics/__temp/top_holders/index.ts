import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { stringifyObjectMsg } from '@/core/utils';
import cronLog from '@/modules/_temp/cron_logs';
import { getCoinList } from '@/modules/_temp/debank/services';
import schedule from 'node-schedule';
import Container from 'typedi';
import { saveTopHoldersStatistics } from '../../services/saveTopHoldersStatistics';
import { SegmentOptions } from '../../types';
import saveLogs from './saveLogs';
import { updateGroupHolders } from './updateGroupHolders';

const jobHandler = async ({ symbol, id, limit, offset, cid }) => {
  try {
    const groupHolders = await updateGroupHolders({
      id,
      symbol,
      offset,
      limit,
      crawl_id: cid,
    });

    groupHolders && await saveTopHoldersStatistics(groupHolders);
  } catch (e) {
    console.log('🚀 ~ file: topHolders.ts:187 ~ jobHandler ~ e', e);
  }
};

/**
 * 1. Get symbol list
 * 2. Get segment & group
 * 3. Process data foreach segment/group
 */
const triggerCronJobs = async (forced_crawl_id?) => {
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

      const jobs = [];
      
      symbols.forEach((symbol) => {
        SegmentOptions.forEach((segment) => {
          jobs.push({
            symbol,
            ...segment,
            cid,

            // for jobid
            crawl_id: `${cid}:${symbol}`,
            offset: segment.offset,
            limit: segment.limit,
          });
        });
      });

      await addJobs(jobs);

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

const scheduleCronJobs = () => {
  schedule.scheduleJob('*/30 * * * *', async function () {
    await triggerCronJobs();
  });
};

export default {
  triggerCronJobs,
  scheduleCronJobs,
};
