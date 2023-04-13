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

const counter = {
  calculateEMA(usdValue, prevUsdValue, numOfTimeFrame) {
    const k = 2 / (numOfTimeFrame + 1);
    return usdValue * k + prevUsdValue * (1 - k);
  },
  getBuySellAlert(volumes) {
    
  }
};

export type SignalCounterType = typeof counter;
export const signalCounter = counter;
