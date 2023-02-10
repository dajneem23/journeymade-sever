import { nodeEnv } from '@/configs/vars';
import { writeJsonFile } from '@/services/file_helper';
import { addSignalsToMongoDB } from '../services/addSignalsToMongoDB';
import topHolders from './topHolders';

export const getSignals = async (symbol) => {
  const signals = await topHolders({ symbol });

  if (nodeEnv === 'production') {
    signals.map(async (signal) => {
      await addSignalsToMongoDB(signal);
    });
  } else {
    signals.length > 0 && writeJsonFile(`signals-${symbol}`, signals);
  }

  const logs = signals.map(
    ({
      symbol,
      count,
      segment_id,
      crawl_id,
      crawl_time,
      total_amount,
      percentage_change,
    }) => {
      return {
        symbol,
        segment_id,
        count,
        crawl_id,
        crawl_time,
        total_amount,
        percentage_change,
      };
    },
  );

  // logs.length > 0 ? console.table(logs) : console.log(symbol, 'no-signals');

  return logs;
};
