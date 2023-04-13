import { groupBy } from '../../utils/groupBy';
import { VolumeRangeOptions } from '../../constants';
import { EAccountTags } from '../../interfaces';
import { sumArrayByField } from '../../utils/sumArrayByField';

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

function calculateEMA(usdValue, prevEMAValue = 0, numOfTimeFrame) {
  const k = 2 / (numOfTimeFrame + 1);
  return usdValue * k + prevEMAValue * (1 - k);
}

const counter = {  
  getSignals(volumes, timeFrames) {
    const topN = 5;
    const buyVolumes = volumes.map((volume) => {
      return {
        time_index: volume.time_index,
        time_frame: volume.time_frame,
        ...volume.buy
      }
    });
    const sellVolumes = volumes.map((volume) => {
      return {
        time_index: volume.time_index,
        time_frame: volume.time_frame,
        ...volume.sell
      }
    });
    const volumesByAction = {
      buy: buyVolumes,
      sell: sellVolumes
    }
    
    const actionTypes = ['buy', 'sell'];
    const numOfTimeFrame = timeFrames.length;
    const EMAValues = actionTypes.map(action => process(volumesByAction[action], action)).flat();

    function process(volumeList, action) {
      const EMAList = [];
      for (let i = 0; i < volumeList.length; i++) {
        const volume = volumeList[i];
        const prevEMAValue = EMAList[0]?.ema_value;
        const eMAValue = calculateEMA(volume.usd_value, prevEMAValue, numOfTimeFrame);
        EMAList.unshift({
          ema_value: eMAValue,
          action: action,
          ...volume,
          from_time: volume.time_frame.from,
          min_usd_value: volumeList.filter((item) => item.time_frame.from <= volume.time_frame.from).map((item) => item.usd_value).sort((a, b) => b - a)[topN],
          parent: volumes.find((item) => item.time_frame.from === volume.time_frame.from)
        });
      }

      /**
       * Filter: volume > EMA and volume > min_usd_value
       */
      const result = EMAList.filter((item) => {
        return item.usd_value > item.ema_value && item.usd_value > item.min_usd_value;
      })

      return result;
    }

    return EMAValues;
  },

  getLeader(txLogs, signal) {
    const { time_frame, action } = signal;
    const signalTxLogs = txLogs.filter((item) => {
      return item.time >= time_frame.from && item.time <= time_frame.to;
    });

    const group = groupBy(signalTxLogs, 'address')
    const list = Object.keys(group).map((address) => {
      return {
        address,
        volume: sumArrayByField(group[address], 'usd_value'),
        buy_volume: sumArrayByField(group[address].filter((item) => item.action === 'buy'), 'usd_value'),
        sell_volume: sumArrayByField(group[address].filter((item) => item.action === 'sell'), 'usd_value'),
        tags: group[address][0].tags,
      }
    })

    const leader = list.sort((a, b) => b.volume - a.volume)[0];
    const leadBuyer = list.sort((a, b) => b.buy_volume - a.buy_volume)[0];
    const leadSeller = list.sort((a, b) => b.sell_volume - a.sell_volume)[0];

    return {
      lead_zone: leader,
      lead_buyer: leadBuyer,
      lead_seller: leadSeller
    }
  },
};

export type SignalCounterType = typeof counter;
export const signalCounter = counter;
