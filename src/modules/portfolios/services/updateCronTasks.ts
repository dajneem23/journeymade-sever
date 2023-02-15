import model from '@/models/cron-tasks.model';
import { CronTask } from '../types';

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

export const updateCronTasks = async (tasks: CronTask[]) => {
  const updateOps = tasks.map((p) =>
    updateOne(
      {
        key: p.key,
        crawl_id: p.crawl_id,
      },
      p,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
