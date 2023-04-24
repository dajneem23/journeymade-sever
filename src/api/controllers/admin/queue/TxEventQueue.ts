import { ioRedisToken } from '@/loaders/ioredis';
import { Job, Queue, Worker } from 'bullmq';
import Container from 'typedi';

export default class TxEventQueue {
  private name;
  readonly connection;

  public queue: Queue;
  public blockNumber;

  constructor(name, options = {}) {
    this.name = name;
    this.connection = Container.get(ioRedisToken);

    this.queue = new Queue(this.name, {
      connection: this.connection,
    });
  }

  async initWorker({ job_handler, concurrency }) {
    const queueName = this.name;
    if (queueName) {
      const worker = new Worker(queueName, job_handler, {
        connection: this.connection,
        concurrency: concurrency,
        lockDuration: 1000 * 60,
        maxStalledCount: 5
      });

      // worker.on('completed', (job: Job) => {
      //   console.log(
      //     'job has completed:',
      //     queueName,
      //     job.name,
      //   );
      // });

      worker.on('failed', (job: Job) => {
        if (job?.data) {
          console.log(
            'job has failed:',
            queueName,
            job.name,
          );
        }
      });

      worker.on('drained', async () => {
        console.log(`🚀 ${queueName} drained`);
      });
    }
  }

  public async addJobs(jobs: Job[]) {
    return await this.queue.addBulk(jobs);
  }

  get instant() {
    return this.queue;
  }
}
