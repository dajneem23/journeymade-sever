import { getCoinList } from './services';
import { getSignals } from './signals';
import schedule from 'node-schedule';
import { nodeEnv } from '@/configs/vars';
import { resolvePromisesSeq } from '@/core/utils';

export default async () => {
  console.log('🚀 ~ file: index.ts:9 ~ nodeEnv', nodeEnv);

  if (nodeEnv !== 'production') {
    init();
    // await getSignals('AMP')
  } else {
    schedule.scheduleJob('*/30 * * * *', async function () {
      init();
    });
  }

  async function init() {
    const coins = await getCoinList();
    const taskPromises = coins.map((symbol) =>
      getSignals(symbol)
        .then((s) => {
          console.log(symbol, s);
        })
        .catch((e) => {
          console.error(e);
        }),
    );
    await resolvePromisesSeq(taskPromises);
  }
};
