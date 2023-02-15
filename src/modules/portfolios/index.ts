import { nodeEnv } from '@/configs/vars';
import schedule from 'node-schedule';
import { initDebankBalancesJobs } from './debankBalances';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  init();

  if (nodeEnv !== 'production') {
    init();
  } else {
    schedule.scheduleJob('30 * * * *', async function () {
      init();
    });
  }

  async function init() {
    // // const symbols = await getCoinList();


    initDebankBalancesJobs();

    // const crawlIds = await getBalancesCrawlId();
    // await Promise.all(
    //   crawlIds.map(
    //     async ({ crawl_id, min_crawl_time, max_crawl_time, count }) => {
    //       updateCronTasks([
    //         <CronTask>{
    //           key: CRON_TASK.balances,
    //           crawl_id: crawl_id,
    //           count: Number(count),
    //           from_crawl_time: min_crawl_time,
    //           to_crawl_time: max_crawl_time,
    //           status: CRON_TASK_STATUS.running,
    //         },
    //       ]);

    //       if (Number(crawl_id) > 2023021501) {
    //         console.log(
    //           '🚀 ~ file: index.ts:27 ~ crawlIds.map ~ crawl_id',
    //           crawl_id,
    //         );
    //         await savePortfolioBalances({ crawl_id, count: Number(count) });
    //       }
    //     },
    //   ),
    // );

    // const projectCrawlIds = await getProjectsCrawlId();
    // await Promise.all(
    //   projectCrawlIds.map(
    //     async ({ crawl_id, min_crawl_time, max_crawl_time, count }) => {
    //       updateCronTasks([
    //         <CronTask>{
    //           key: CRON_TASK.projects,
    //           crawl_id: crawl_id,
    //           count: Number(count),
    //           from_crawl_time: min_crawl_time,
    //           to_crawl_time: max_crawl_time,
    //           status: CRON_TASK_STATUS.running,
    //         },
    //       ]);
    //       console.log(
    //         '🚀 ~ file: index.ts:27 ~ crawlIds.map ~ crawl_id',
    //         crawl_id,
    //       );

    //       await savePortfolioProjects({ crawl_id, count });
    //     },
    //   ),
    // );

    console.log('done!!!');
  }
};
