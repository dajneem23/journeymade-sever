import model from '@/models/cron-logs.model';
import { CronLog } from '../types';

// Update function
function updateOne(filter, update) {
  return {
    updateOne: {
      filter,
      update: {
        $set: update,
      },
      upsert: true,
    },
  };
}

export const save = async (logs: CronLog[]) => {
  const updateOps = logs.map((l) =>
    updateOne(
      {
        job_name: l.job_name,
        crawl_id: l.crawl_id,
      },
      l,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
