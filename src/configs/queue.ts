import { CronJobProp } from '@/modules/portfolios/types';
import { getJobId } from '@/modules/portfolios/utils';

// worker queues running on the worker server
// const Queue = require('bee-queue');
import { Job, Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis();

export const CronQueue = (name, job_handler) => {
  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      // The total number of attempts to try the job until it completes
      attempts: 5,
      // Backoff setting for automatic retries if the job fails
      backoff: { type: 'fixed', delay: 10 * 1000 },
      removeOnComplete: {
        // 6 hour
        age: 60 * 60 * 6,
      },
      removeOnFail: {
        age: 60 * 60 * 8,
      },
    },
  });

  const worker = new Worker(
    name,
    job_handler,
    { connection, concurrency: 15 },
  );

  worker.on('completed', (job: Job) => {
    console.log('job has completed:', name, job.id, job.finishedOn - job.processedOn);
  });

  worker.on('failed', (job: Job) => {
    console.log('job has failed:', name, job.id);
  });

  worker.on('drained', () => {
    console.log('queue drained, no more jobs left', name);
  });

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
    worker,
    addJobs,
  };
};
