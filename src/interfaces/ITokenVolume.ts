export enum ETokenVolumeAction {
  BUY = 'buy',
  SELL = 'sell',
}

type IActionData = {
  count: number;
  amount: number;
  usd_value: number;
  price?: number;
  tags?: string[];
  change_percentage?: number;
}

export type ITokenVolume = IActionData & {
  token_address: string;
  from_time: number;
  to_time: number;
  period: string;

  chain: string;
  chain_id: number;

  token_id: string;
  token_symbol: string;

  buy: IActionData;
  sell: IActionData;
}

export type IChartDataVolume = IActionData & {
  time_bucket: string;
  timestamp: number;
  time_index?: number;
  period: string;
  buy: IActionData;
  sell: IActionData;
  open_price?: number;
  close_price?: number;
  high_price?: number;
  low_price?: number;
}

