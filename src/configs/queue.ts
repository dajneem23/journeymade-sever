import { CronJobProp } from '@/modules/portfolios/types';

// worker queues running on the worker server
const Queue = require('bee-queue');

export const CronQueue = (name, prefix, job_handler) => {
  const queue = new Queue(name, {
    prefix: prefix,
    stallInterval: 5000,
    nearTermWindow: 1200000,
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
      options: {},
    },
    isWorker: true,
    getEvents: true,
    sendEvents: true,
    storeJobs: true,
    ensureScripts: true,
    activateDelayedJobs: false,
    removeOnSuccess: false,
    removeOnFailure: false,
    redisScanCount: 100,
  });

  queue.on('ready', () => {
    console.log('queue now ready to start doing things');
  });

  queue.process(async (job) => {
    return job_handler(job);
  });

  queue.on('succeeded', (job, result) => {
    console.log(`Job ${job.id} succeeded: ${result}`);
  });

  queue.on('error', (err) => {
    console.log(`A queue error happened: ${err.message}`);
  });

  queue.on('retrying', (job, err) => {
    console.log(
      `Job ${job.id} failed with error ${err.message} but is being retried!`,
    );
  });

  queue.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed with error ${err.message}`);
  });

  queue.on('stalled', (jobId) => {
    console.log(`Job ${jobId} stalled and will be reprocessed`);
  });

  const addJobs = (props: CronJobProp[]) => {
    const jobs = props.map((prop) =>
      queue.createJob(prop).timeout(20000).retries(2).save(),
    );

    queue.saveAll(jobs).then((errors) => {
      if (errors && Object.keys(errors).length > 0) {
        console.log('🚀 ~ errors', errors);
      }
      // The errors value is a Map associating Jobs with Errors. This will often be an empty Map.
    });
  };

  return {
    addJobs,
  };
};
