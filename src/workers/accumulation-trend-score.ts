import { EAccountTags } from '../interfaces';
import { VolumeRangeOptions } from '../constants';
import { expose } from 'threads/worker';
import { sumArrayByField } from '../utils/sumArrayByField';
import dayjs from '../utils/dayjs';

const tags = Object.values(EAccountTags);

interface TxLog {
  token?: string;
  tx_hash?: string;
  chain_id?: number;
  address?: string;
  action: 'buy' | 'sell';
  price: number;
  amount: number;
  usd_value: number;
  symbol?: string;
  tags: string[];
  time?: number;
  time_frame?: number;
}

const topHoldersGroups = [
  [0, 10], // [offset, limit]
  [0, 20],
  [0, 50],
  [0, 100],
  [0, 500],
  [500, 1000],
]

const counter = {
  
  getScore(data, timeFrames, holders) {
    console.log("🚀 ~ file: accumulation-trend-score.ts:36 ~ getScore ~ data:", data)
    const groups = topHoldersGroups.map(([offset, limit]) => {
      return {
        id: `${offset}-${limit}`,
        holders: holders.slice(offset, limit),
      }
    })

    const actions = ['buy', 'sell'], result = [];
    timeFrames.forEach((tf, tfIdx) => {
      groups.forEach((thf, thIdx) => {
        
        result.push({
          from_time: tf,
          to_time: timeFrames[tfIdx + 1] || (tf + (tf - timeFrames[tfIdx - 1])),
          time_index: tfIdx,
          
          th_frame: thf.id,
          th_index: thIdx,
          holders: thf.holders.map((h) => h.toLowerCase()),

          buy: {
            count: 0,
            amount: 0,
            usd_value: 0, 
          },
          sell: {
            count: 0,
            amount: 0,
            usd_value: 0, 
          },

          logs: [],
        });
      });
    });

    data.forEach((txLog) => {
      const foundIndex = result.findIndex(
        (zone) =>txLog.time >= zone.from_time &&
          txLog.time <= zone.to_time &&
          zone.holders.includes(txLog.address.toLowerCase())
      );
      
      if (foundIndex === -1) {
        console.log("🚀 ~ file: behavior-stats.ts:131 ~ data.forEach ~ zoneIndex:", foundIndex, txLog)
        return;
      }

      result[foundIndex].logs.push(txLog);
    });
    console.log("🚀 ~ file: accumulation-trend-score.ts:40 ~ groups ~ result:", result)

    return [];
  },

  
};

export type Counter = typeof counter;

expose(counter);
