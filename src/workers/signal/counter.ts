import { groupBy } from '../../utils/groupBy';
import { VolumeRangeOptions } from '../../constants';
import { EAccountTags } from '../../interfaces';
import { sumArrayByField } from '../../utils/sumArrayByField';

interface Item {
  count: number;
  amount: number;
  usd_value: number;
  price: number;
  tags: {
    id: string;
    count: number;
    amount: number;
    usd_value: number;
  }[];
  time_index: number;
  time_frame: {
    from: number;
    to: number;
  };
}

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

function filterDataByActionType(volumes: any[], type: string) {
  return volumes
    .map((volume) => {
      if (!volume[type]) return null;

      return {
        ...volume[type],
        time_index: volume.time_index,
        time_frame: volume.time_frame,
      };
    })
    .filter((volume) => volume);
}

function getAvgUsdValue(data: Item[]) {
  const count = data.length;
  return (
    data.map((volume) => volume.usd_value).reduce((a, b) => a + b, 0) / count
  );
}

const counter = {
  /**
   * data: [...startItems, prevItem, ...mainItems]
   * startItems: number of frames to calculate prevEMA of first EMA value (24, 42, 30...)
   * prevItem: to calculate first EMA value
   * mainItems: number of frames to calculate EMAs (12, 25,...)
   *
   */
  getRawSignals(data, prevItemCount) {
    const topN = 5;
    const buyData = filterDataByActionType(data, 'buy');
    const sellData = filterDataByActionType(data, 'sell');

    const firstBuyEMA = getAvgUsdValue(buyData.slice(0, prevItemCount));
    const firstSellEMA = getAvgUsdValue(sellData.slice(0, prevItemCount));

    const prevBuyItem = buyData[prevItemCount];
    const prevBuyEMA = calculateEMA(
      prevBuyItem.usd_value,
      firstBuyEMA,
      prevItemCount,
    );

    const prevSellItem = sellData[prevItemCount];
    const prevSellEMA = calculateEMA(
      prevSellItem.usd_value,
      firstSellEMA,
      prevItemCount,
    );

    const mainBuyItems = buyData.slice(prevItemCount + 1);
    const mainSellItems = sellData.slice(prevItemCount + 1);

    const EMAValues = [
      { items: mainBuyItems, prevEMA: prevBuyEMA, action: 'buy' },
      { items: mainSellItems, prevEMA: prevSellEMA, action: 'sell' },
    ]
      .map(({ items, prevEMA, action }) => {
        return process(items, prevEMA, action);
      })
      .flat();


    function process(items, prevEMA, action) {
      const EMAList = [];
      const count = items.length;
      for (let i = 0; i < items.length; i++) {
        const volume = items[i];
        const prevEMAValue =
          EMAList[0]?.ema_value || prevEMA;
        const eMAValue = calculateEMA(
          volume.usd_value,
          prevEMAValue,
          count,
        );
        EMAList.unshift({
          ema_value: eMAValue,
          action: action,
          ...volume,
          from_time: volume.time_frame.from,
          min_usd_value: items
            .filter((item) => item.time_frame.from <= volume.time_frame.from)
            .map((item) => item.usd_value)
            .sort((a, b) => b - a)[topN],
          parent: data.find(
            (item) => item.time_frame.from === volume.time_frame.from,
          ),
        });
      }

      /**
       * Filter: volume > EMA and volume > min_usd_value
       */
      const result = EMAList.filter((item) => {
        return (
          item.usd_value > item.ema_value && item.usd_value > item.min_usd_value
        );
      });

      return result;
    }

    return {
      EMAValues,
    };
  },

  getLeader(txLogs, signal) {
    const { time_frame, action } = signal;
    const signalTxLogs = txLogs.filter((item) => {
      return item.time >= time_frame.from && item.time <= time_frame.to;
    });

    const group = groupBy(signalTxLogs, 'address');
    const list = Object.keys(group).map((address) => {
      return {
        address,
        volume: sumArrayByField(group[address], 'usd_value'),
        buy_volume: sumArrayByField(
          group[address].filter((item) => item.action === 'buy'),
          'usd_value',
        ),
        sell_volume: sumArrayByField(
          group[address].filter((item) => item.action === 'sell'),
          'usd_value',
        ),
        tags: group[address][0].tags,
        chain_id: group[address][0].chain_id,
      };
    });

    const leader = list.sort((a, b) => b.volume - a.volume)[0];
    const leadBuyer = list.sort((a, b) => b.buy_volume - a.buy_volume)[0];
    const leadSeller = list.sort((a, b) => b.sell_volume - a.sell_volume)[0];

    return {
      lead_zone: leader,
      lead_buyer: leadBuyer,
      lead_seller: leadSeller,
    };
  },
};

export type SignalCounterType = typeof counter;
export const signalCounter = counter;
