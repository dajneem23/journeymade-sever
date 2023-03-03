import schedule from 'node-schedule';
import { CronQueue } from '@/configs/queue';
import { nodeEnv } from '@/configs/vars';
import { getNansenTransactions } from './services/getNansenTransactions';
import { saveAddressBook } from './services/saveAddressBook';
import { WalletInfo } from './types';
import { getTagsByPrefix, parseAddressFromUrl } from './utils';

/**
 * update wallet label from nansen bot alert db
 */

const max = 1000;
const limit = 100;
const noLabelPrefix = '0x';

const jobHandler = async ({ offset, limit }) => {
  try {
    const raws = await getNansenTransactions({ offset, limit });
    console.log("🚀 ~ file: index.ts:18 ~ jobHandler ~ raws", raws.length)
    const data = raws
      .map((raw) => {
        const { sender, sender_profile, receiver, receiver_profile, token } =
          raw;
        const wallets = [];

        if (sender && !sender.startsWith(noLabelPrefix) && sender_profile) {
          wallets.push(<WalletInfo>{
            address: parseAddressFromUrl(sender_profile),
            labels: [sender],
            tags: getTagsByPrefix(sender),
            tokens: [token],
          });
        }

        if (receiver && !receiver.startsWith(noLabelPrefix) && receiver_profile) {
          wallets.push(<WalletInfo>{
            address: parseAddressFromUrl(receiver_profile),
            labels: [receiver],
            tags: getTagsByPrefix(receiver),
            tokens: [token],
          });
        }

        return wallets;
      })
      .flat();

    await saveAddressBook(data);
  } catch (e) {
    console.log('🚀 ~ file: index.ts:16 ~ jobHandler ~ e', e);
  }
};

const init = async () => {
  const queueName = 'nansen';
  const { addJobs } = await CronQueue({
    name: queueName,
    job_handler: async ({ data }) => {
      return await jobHandler(data);
    },
    drained_callback: async () => {
      console.log(
        '🚀 ~ file: index.ts:19 ~ drained_callback: ~ drained_callback',
      );
    },
    job_options: {
      // The total number of attempts to try the job until it completes
      attempts: 3,
      // Backoff setting for automatic retries if the job fails
      backoff: { type: 'fixed', delay: 10 * 1000 },
      removeOnComplete: true, 
      removeOnFail: true
    }
  });

  const jobs = [];
  for (let i = 0; i < max; i += limit) {
    jobs.push({
      crawl_id: 'bot',
      offset: i,
      limit,
    });
  }

  await addJobs(jobs);
};

export default async () => {
  await init();

  if (nodeEnv === 'production') {
    schedule.scheduleJob('0 * * * *', async function () {
      await init();
    });
  } 
};
