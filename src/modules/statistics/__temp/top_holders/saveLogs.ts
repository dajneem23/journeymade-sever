import cronLog from '@/modules/cron_logs';
import { CronLog } from '@/modules/cron_logs/types';
import { countDocuments } from '../../services/countDocuments';
import { CRON_TASK } from '../../types';

const saveLogs = async ({ queue, raw_count, crawl_id, job_count }) => {
  const jobCounts = await queue.getJobCounts(
    'active',
    'completed',
    'failed',
    'wait',
  );
  const resultCount = await countDocuments({
    crawl_id,
  });

  cronLog.save([
    <CronLog>{
      job_name: CRON_TASK.top_holders,
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
};

export default saveLogs;
