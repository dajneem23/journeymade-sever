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
  tx_action?: string;
  maker_account?: string;
  log_index?: number;
}

type TAction = {
  count: number;
  amount: number;
  usd_value: number;
  price: number;
  tags: any[];
  logs: any[];
};

type TGridZoneData = {
  time_frame: { from: number; to: number };
  volume_frame: { from: number; to: number };

  time_index: number;
  volume_index: number;

  buy: TAction;
  sell: TAction;
} & TAction;

const LIQUIDITY_POOL_TYPE = 'liquidity_pool';
const ignoredTags = ['CE', 'BINANCE', 'GATE', 'BOT'];
function inWhitelist(tags: string[]) {
  if (!tags) return true;

  return tags.filter((tag) => ignoredTags.includes(tag))?.length === 0;
}

const counter = {
  getBuySellData(txLogs, timeFrame) {
    const output: Output[] = txLogs
      .map((txLog) => {
        const { from_account_type, to_account_type } = txLog;
        const isBuy = from_account_type === LIQUIDITY_POOL_TYPE && inWhitelist(txLog.to_account_tags);
        const isSell = to_account_type === LIQUIDITY_POOL_TYPE && inWhitelist(txLog.from_account_tags);
        
        const result = [];        
        if (isBuy) {
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
            tx_action: txLog.tx_action,
            maker_account: txLog.maker_account,
            log_index: txLog.log_index,
          };
          result.push(buy)
        }

        if (isSell) {
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
            tx_action: txLog.tx_action,
            maker_account: txLog.maker_account,
            log_index: txLog.log_index,
          };
          result.push(sell)
        }

        return result
      })
      .flat();


    return output;
  },
  getVolumeFrames(groupedTxLogs) {
    const max = Math.max(
      ...groupedTxLogs.map((txLogs) => {
        return sumArrayByField(txLogs, 'usd_value');
      }),
    );

    return (
      VolumeRangeOptions.find((o) => max <= o[0] && max > o[1]) ||
      VolumeRangeOptions[VolumeRangeOptions.length - 1]
    ).slice().reverse();
  },

  getChartData(timeFrames, volumeFrames, txLogs) {
    const dataGrid: TGridZoneData[] = [];

    timeFrames.forEach((tf, tfIdx) => {
      volumeFrames.forEach((vf, vfIdx) => {
        dataGrid.push({
          time_frame: {
            from: tf,
            to: timeFrames[tfIdx + 1] || tf + (tf - timeFrames[tfIdx - 1]),
          },
          volume_frame: {
            from: vf,
            to: volumeFrames[vfIdx + 1] || vf + (vf - volumeFrames[vfIdx - 1]),
          },

          time_index: tfIdx,
          volume_index: vfIdx,

          count: 0,
          amount: 0,
          usd_value: 0,
          price: 0,
          tags: [],
          logs: [],

          buy: {
            count: 0,
            amount: 0,
            usd_value: 0,
            price: 0,
            tags: [],
            logs: [],
          },

          sell: {
            count: 0,
            amount: 0,
            usd_value: 0,
            price: 0,
            tags: [],
            logs: [],
          },
        } as TGridZoneData);
      });
    });

    txLogs.forEach((txLog) => {
      const foundIndex = dataGrid.findIndex(
        (zone) =>
          txLog.time >= zone.time_frame.from &&
          txLog.time <= zone.time_frame.to &&
          txLog.usd_value >= zone.volume_frame.from &&
          txLog.usd_value < zone.volume_frame.to,
      );

      if (foundIndex === -1) {
        console.log(
          '🚀 ~ file: volume.ts:82 ~ data.forEach ~ foundIndex:',
          foundIndex,
          txLog,               
        );
        return;
      }

      dataGrid[foundIndex].count += 1;
      dataGrid[foundIndex].amount += +txLog.amount;
      dataGrid[foundIndex].usd_value += +txLog.usd_value;

      dataGrid[foundIndex].logs.push(txLog);
      dataGrid[foundIndex][txLog.action].logs.push(txLog);
    });

    dataGrid.forEach((zone) => {
      zone.price = zone.amount > 0 ? zone.usd_value / zone.amount : 0;

      zone.buy.count = zone.buy.logs.length;
      zone.buy.amount =
        zone.buy.count > 0 ? sumArrayByField(zone.buy.logs, 'amount') : 0;
      zone.buy.usd_value =
        zone.buy.count > 0 ? sumArrayByField(zone.buy.logs, 'usd_value') : 0;
      zone.buy.price =
        zone.buy.amount > 0 ? zone.buy.usd_value / zone.buy.amount : 0;

      zone.sell.count = zone.sell.logs.length;
      zone.sell.amount =
        zone.sell.count > 0 ? sumArrayByField(zone.sell.logs, 'amount') : 0;
      zone.sell.usd_value =
        zone.sell.count > 0 ? sumArrayByField(zone.sell.logs, 'usd_value') : 0;
      zone.sell.price =
        zone.sell.amount > 0 ? zone.sell.usd_value / zone.sell.amount : 0;

      zone.volume_index +=
        zone.usd_value > 0
          ? (zone.usd_value - zone.volume_frame.from) /
            (zone.volume_frame.to - zone.volume_frame.from)
          : 0;

      const tagList = Array.from(
        new Set(zone.logs.map((log) => log.tags).flat()),
      ).filter((t) => !!t);
      zone.tags = tagList.map((tag) => {
        const count = zone.logs.filter((log) => log.tags?.includes(tag)).length;
        const amount =
          count > 0
            ? sumArrayByField(
                zone.logs.filter((log) => log.tags?.includes(tag)),
                'amount',
              ) / count
            : 0;
        const usd_value =
          count > 0
            ? sumArrayByField(
                zone.logs.filter((log) => log.tags?.includes(tag)),
                'usd_value',
              ) / count
            : 0;
        return {
          id: tag,
          count,
          amount,
          usd_value,
        };
      });
    });

    return dataGrid //.filter(zone => zone.count > 0);
  },

  getPriceRanges(txLogs) {
    const priceList = txLogs
      .filter((txLog) => txLog.price > 0)
      .map((txLog) => txLog.price);
    const min = Math.min(...priceList);
    const max = Math.max(...priceList);

    return {
      min: min - (max - min) * 0.2,
      max: max + (max - min) * 0.2,
    };
  },
};

export type VolumeCounterType = typeof counter;
export const volumeCounter = counter;
