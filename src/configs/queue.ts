import { CronJobProp } from '@/modules/portfolios/types';
import { getJobId } from '@/modules/portfolios/utils';

import { ioRedisToken } from '@/configs/ioredis';
import { Job, Queue, Worker } from 'bullmq';
import Container from 'typedi';

export const CronQueue = async ({
  name,
  job_handler,
  drained_callback = null,
}) => {
  const connection = Container.get(ioRedisToken);

  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      // The total number of attempts to try the job until it completes
      attempts: 10,
      // Backoff setting for automatic retries if the job fails
      backoff: { type: 'fixed', delay: 10 * 1000 },
      removeOnComplete: {
        // 6 hour
        age: 60 * 60 * 6,
      },
      removeOnFail: {
        age: 15 * 60, // 15mins
      },
    },
  });

  const workers = await queue.getWorkers();
  const found = workers.find(({ name }) => name === name);
  if (!found) {
    const worker = new Worker(name, job_handler, {
      connection,
      concurrency: 120,
    });

    worker.on('completed', (job: Job) => {
      console.log(
        'job has completed:',
        name,
        job.id,
        job.finishedOn - job.processedOn,
      );
    });

    worker.on('failed', (job: Job) => {
      console.log(
        'job has failed:',
        name,
        job.id,
        job.finishedOn - job.processedOn,
      );
    });

    worker.on('drained', async () => {
      drained_callback && drained_callback();
    });
  }

  const addJobs = async (props: CronJobProp[]) => {
    const jobs = props.map((prop) => {
      return {
        name,
        data: prop,
        opts: {
          jobId: getJobId(prop),
        },
      };
    });

    await queue.addBulk(jobs);
  };

  return {
    queue,
    addJobs,
  };
};
