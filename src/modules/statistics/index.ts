import schedule from 'node-schedule';
import { nodeEnv } from '@/configs/vars';
import { groupBy, sortArray } from '@/core/utils';
import cronLog from '@/modules/cron_logs';
import { getCoinList } from '../debank/services';
import { addSignalsToMongoDB } from '../debank/services/addSignalsToMongoDB';
import { getTopHoldersBySymbol } from './topHolders';

export default async () => {
  const init = async () => {
    console.log('🚀 ~ nodeEnv', nodeEnv);

    const rawLogs = await cronLog.get();
    const ids = new Set(rawLogs.map((l) => l.crawl_id));
    const crawlIds = Array.from(ids).sort().reverse();
    console.log('🚀 ~ file: index.ts:12 ~ crawlIds', crawlIds);

    const symbols = await getCoinList();

    await Promise.all(
      symbols.map(async (symbol) => {
        const results = await getTopHoldersBySymbol({
          symbol,
          current_id: crawlIds[0],
          prev_id: crawlIds[2],
        });

        await Promise.all(
          results.map(async (item) => {
            item && (await addSignalsToMongoDB(item));
          }),
        );
      }),
    );

    console.log('done!');
  };

  if (nodeEnv !== 'production') {
    await init();
  } else {
    schedule.scheduleJob('*/20 * * * *', async function () {
      await init();
    });
  }
};
