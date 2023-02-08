import dayjs from 'dayjs';
import { candlestickCount } from '../../../configs/vars';
import { writeJsonFile } from '../../../services/file_helper/index';
import { infoLog } from '../../../services/printer/index';
import { CandleStickItem } from '../types';
import { generateID, sumByFieldOfArray } from './index';

export const groupByTimeFrame = (
  candleStickItems: CandleStickItem[],
  timeFrame: number,
  limit = candlestickCount,
) => {
  const raws = [...candleStickItems].slice(0, timeFrame * (limit + 1));
  const result = [];

  const group = [];
  raws.forEach((row) => {
    const date = dayjs.unix(row.time_stamp / 1000);
    const timestampInMinus = date.hour() * 60 + date.minute();

    group.push(row);

    if (timestampInMinus % timeFrame === 0) {
      result.push([...group]);
      group.length = 0;
    }
  });

  if (result[0]) {
    infoLog(`Remaining: , ${timeFrame - result[0].length}`);
    infoLog(`Last: , ${dayjs.unix(raws[0].time_stamp / 1000).toISOString()}`);
  }

  return result;
};


export const getDataByTimeFrame = (
  candleStickItems: CandleStickItem[],
  timeFrame: number,
  limit = candlestickCount,
) => {
  const result = [];
  const groups = groupByTimeFrame(candleStickItems, timeFrame, limit);

  if (groups.length > 0) {
    groups.forEach((group) => {
      const a = group[group.length - 1].open,
      b = group[0].close,
      c = Math.max(...group.map((item) => item.high)),
      d = Math.min(...group.map((item) => item.low))

      const merge: CandleStickItem = {
        cid: generateID({
          symbol: group[0].symbol,
          time_stamp: group[group.length - 1].time_stamp,
          time_frame: timeFrame
        }),
        symbol: group[0].symbol,
        a,
        b,
        c,
        d,
        volume: sumByFieldOfArray(group, 'volume'),
        trades: sumByFieldOfArray(group, 'trades'),
        quote_volume: sumByFieldOfArray(group, 'quote_volume'),
        buy_volume: sumByFieldOfArray(group, 'buy_volume'),
        quote_buy_volume: sumByFieldOfArray(group, 'quote_buy_volume'),
        time_stamp: group[group.length - 1].time_stamp,
        // time_stamps: group.map(i => i.time_stamp),
        time_frame: timeFrame,
        remaining: timeFrame - group.length,
      };
  
      result.push(merge);
    });
  }

  return result;
};
