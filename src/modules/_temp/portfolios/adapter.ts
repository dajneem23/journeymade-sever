import { CronQueue } from '@/configs/queue';
import { telegramBotToken } from '@/configs/telegram';
import { stringifyObjectMsg } from '@/core/utils';
import cronLog from '@/modules/_temp/cron_logs';
import schedule from 'node-schedule';
import Container from 'typedi';
import { CronLog } from '../cron_logs/types';
import setLimitedInterval from '../statistics/utils/setLimitedInterval';
import { countDocuments } from './services/countDocuments';
import { savePortfolios } from './services/savePortfolios';
import { generateCronJobs } from './utils/jobHelpers';

class PortfolioAdapter {
  readonly id: string;
  readonly raw_limit: number;
  readonly countNumberOfDocuments: void;

  constructor({ id, raw_limit, count_function }) {
    this.id = id;
    this.raw_limit = raw_limit;
    this.countNumberOfDocuments = count_function;
  }

  generateRefId(items: string[]) {
    return [this.id]
      .concat(...items)
      .join(':')
      .trim()
      .toLowerCase();
  }

  async jobHandler(data) {
    return data;
  }

  async triggerCronJobs(only_crawl_id?) {
    const telegramBot = Container.get(telegramBotToken);

    const cronJobs = await generateCronJobs({
      countFunction: this.countNumberOfDocuments,
      only_crawl_id,
      limit: this.raw_limit,
    });

    await Promise.all(
      cronJobs.map(async ({ crawl_id, raw_count, jobs }) => {
        const queueName = `${this.id}:${crawl_id}`;
        const { queue, addJobs } = await CronQueue({
          name: queueName,
          job_handler: async (dt) => {
            await this.jobHandler(dt);
          },
          drained_callback: async () => {
            setTimeout(async () => {
              const { jobCounts, resultCount } = await this.saveLogs({
                queue,
                crawl_id,
                raw_count,
                job_count: jobs.length,
              });

              const msg = `${queue.name}: queue drained ${stringifyObjectMsg({
                num_of_jobs: jobs.length,
                job_queue_status: jobCounts,
                pg_raw: raw_count,
                mongo_updated: resultCount,
              })}`;
              telegramBot.sendMessage(msg);
              console.log(msg);
            }, 60000);

            setLimitedInterval(
              () => {
                queue.getFailed().then(async (jobs) => {
                  return await Promise.all(jobs.map((job) => job.retry()));
                });

                this.saveLogs({
                  queue,
                  crawl_id,
                  raw_count,
                  job_count: jobs.length,
                });
              },
              300 * 1000,
              5,
            );
          },
        });

        await addJobs(jobs);

        const { jobCounts, resultCount } = await this.saveLogs({
          queue,
          crawl_id,
          raw_count,
          job_count: jobs.length,
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
  }

  async saveData({ crawl_id, offset, portfolios }) {
    if (portfolios?.length > 0) {
      try {
        const crawlDateId = String(crawl_id).substring(0, 8);
        await savePortfolios(crawlDateId, portfolios);
      } catch (e) {
        console.log(
          '🚀 ~ file: adapter.ts:105 ~ PortfolioAdapter ~ saveData ~ e:',
          e,
        );
        throw new Error(e);
      }
    }

    return `${crawl_id}: ${offset} - count=${portfolios.length}`;
  }

  async saveLogs({ queue, raw_count, crawl_id, job_count }) {
    const jobCounts = await queue.getJobCounts(
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
        job_name: this.id,
        crawl_id,
        data: {
          raw_count,
          result_count: resultCount,
        },
        job_status: jobCounts,
        job_count,
      },
    ]);

    return {
      jobCounts,
      resultCount,
    };
  }

  scheduleCronJobs = () => {
    schedule.scheduleJob('*/30 * * * *', async function () {
      await this.triggerCronJobs();
    });
  };
}

export default PortfolioAdapter;
