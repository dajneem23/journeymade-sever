import { EAccountTags } from '../interfaces';
import { VolumeRangeOptions } from '../constants';
import { expose } from 'threads/worker';
import { sumArrayByField } from '../utils/sumArrayByField';
import dayjs from '../utils/dayjs';

const tags = Object.values(EAccountTags);

interface Output {
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

const counter = {
  getDataInTimeFrame(value, timeFrame) {
    const output: Output[] = value
      .map((txLog) => {
        const result = [];

        const isBuy = txLog.from_account_type === 'liquidity_pool';
        if (isBuy) {
          const buy: Output = {
            // token: txLog.token,
            address: txLog.to_account,
            tx_hash: txLog.tx_hash,
            chain_id: txLog.chain_id,
            action: 'buy',
            price: txLog.price,
            amount: txLog.amount,
            usd_value: txLog.usd_value,
            symbol: txLog.symbol,
            tags: txLog.to_account_tags,
            time: txLog.block_at,
            time_frame: timeFrame[0],
          };
          result.push(buy)
        }

        const isSell = txLog.to_account_type === 'liquidity_pool';
        if (isSell) {
          const sell: Output = {
            // token: txLog.token,
            address: txLog.from_account,
            tx_hash: txLog.tx_hash,
            chain_id: txLog.chain_id,
            action: 'sell',
            price: txLog.price,
            amount: txLog.amount,
            usd_value: txLog.usd_value,
            symbol: txLog.symbol,
            tags: txLog.from_account_tags,
            time: txLog.block_at,
            time_frame: timeFrame[0],
          };
          result.push(sell)
        }

        return result
      })
      .flat();

    return output;
  },

  getVolumeFrames(data) {
    const max = Math.max(...data.map((txLog) => +txLog.usd_value));
    return (
      VolumeRangeOptions.find((o) => max <= o[0] && max > o[1]) ||
      VolumeRangeOptions[VolumeRangeOptions.length - 1]
    ).reverse();
  },

  getVolumeZoneData(timeFrames, volumeFrames, data) {
    const actions = ['buy', 'sell'] ,zones = [];
    timeFrames.forEach((tf, tfIdx) => {
      volumeFrames.forEach((vf, vfIdx) => {
        
        actions.forEach((action) => {
          zones.push({
            from_time: tf,
            to_time: timeFrames[tfIdx + 1] || (tf + (tf - timeFrames[tfIdx - 1])),
  
            from_volume: vf,
            to_volume: volumeFrames[vfIdx + 1] || (vf + (vf - volumeFrames[vfIdx - 1])),

            vol_index: vfIdx,
            time_index: tfIdx,

            action,

            count: 0,
            amount: 0,
            usd_value: 0,
            price: 0,
            tags: [],
            logs: [],
          });
        })
      });
    });

    data.forEach((txLog) => {
      const zoneIndex = zones.findIndex(
        (zone) =>txLog.time >= zone.from_time &&
          txLog.time <= zone.to_time &&
          txLog.usd_value < zone.to_volume &&
          txLog.usd_value >= zone.from_volume &&
          txLog.action === zone.action
      );
      
      if (zoneIndex === -1) {
        console.log("🚀 ~ file: behavior-stats.ts:131 ~ data.forEach ~ zoneIndex:", zoneIndex, txLog)
        return;
      }

      zones[zoneIndex].logs.push(txLog);
    });

    zones.forEach((zone) => {
      zone.count = zone.logs.length;
      zone.amount = zone.count > 0 ? sumArrayByField(zone.logs, 'amount')/zone.count : 0;
      zone.usd_value = zone.count > 0 ? sumArrayByField(zone.logs, 'usd_value')/zone.count : 0;

      zone.last_tx_time = zone.count > 0 ? Math.max(...zone.logs.map(log => log.time)) : 0;

      zone.vol_index += zone.usd_value > 0 ? (zone.usd_value - zone.from_volume) / (zone.to_volume - zone.from_volume) : 0;

      // zone.time_index += zone.last_tx_time > 0 ? (zone.last_tx_time - zone.from_time) / (zone.to_time - zone.from_time) : 0;

      zone.price = zone.count > 0 ? sumArrayByField(zone.logs, 'price')/zone.count : 0;
      zone.sum_usd_value = zone.count > 0 ? sumArrayByField(zone.logs, 'usd_value') : 0;

      const tagList = Array.from(new Set(zone.logs.map(log => log.tags).flat())).filter(t => !!t);
      zone.tags = tagList.map(tag => {
        const count = zone.logs.filter(log => log.tags?.includes(tag)).length;
        const amount = count > 0 ? sumArrayByField(zone.logs.filter(log => log.tags?.includes(tag)), 'amount') / count : 0;
        const usd_value = count > 0 ? sumArrayByField(zone.logs.filter(log => log.tags?.includes(tag)), 'usd_value') / count : 0;
        return {
          id: tag,
          count,
          amount,
          usd_value,
        }
      })
    })

    return zones //.filter(zone => zone.count > 0);
  },
};

export type Counter = typeof counter;

expose(counter);
