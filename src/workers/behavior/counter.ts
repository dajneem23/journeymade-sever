import { VolumeRangeOptions } from '../../constants';
import { EAccountTags } from '../../interfaces';
import { sumArrayByField } from '../../utils/sumArrayByField';

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

/**
 * 1. Tuong tac vs smart contract cua LP: from/to_type is LP
 * 2. Transfer sang vi CE
 */

const ignoredTags = ['CE', 'BINANCE', 'GATE', 'BOT'];
function inWhitelist(tags: string[]) {
  if (!tags) return true;

  return tags.filter((tag) => ignoredTags.includes(tag))?.length === 0;
}

const counter = {
  
  getDataInTimeFrame(value, timeFrame) {
    const validLogs = value.filter((log) => {
      const tags = [...(log.to_account_tags || []), ...(log.from_account_tags || [])];
      return tags.includes('CE');
    });

    const exchangeTXs = new Set(validLogs.map((log) => log.tx_hash));

    const output: Output[] = value
      .map((txLog) => {
        if (!exchangeTXs.has(txLog.tx_hash)) return [];

        const result = [];        
        if (inWhitelist(txLog.to_account_tags)) {
          const buy: Output = {
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

        if (inWhitelist(txLog.from_account_tags)) {
          const sell: Output = {
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
    ).slice().reverse();
  },

  getVolumeZoneData(timeFrames, volumeFrames, data) {
    const actions = ['buy', 'sell'] ,zones = [];
    const maxTimeFrame = Math.max(...timeFrames);
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
      zone.balance_snapshot = zone.count > 0 ? sumArrayByField(zone.logs, 'balance_snapshot')/zone.count : 0;

      zone.last_tx_time = zone.count > 0 ? Math.max(...zone.logs.map(log => log.time)) : 0;

      zone.vol_index += zone.usd_value > 0 ? (zone.usd_value - zone.from_volume) / (zone.to_volume - zone.from_volume) : 0;

      zone.time_index += zone.last_tx_time > 0 ? (zone.last_tx_time - zone.from_time) / (zone.to_time - zone.from_time) : 0;

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

export type BehaviorCounterType = typeof counter;
export const behaviorCounter = counter;
