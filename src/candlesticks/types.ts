export type CandleStickItem = {
  cid: string;
  symbol: string;
  open?: number;
  close?: number;
  high?: number;
  low?: number;
  a: number; // open
  b: number; // close
  c: number; // hight
  d: number; // low
  volume: number;
  trades: number;
  quote_volume: number;
  buy_volume: number;
  quote_buy_volume: number;
  time_stamp: number;
  time_stamps?: number[];
  time_frame?: number;
  remaining?: number;
};

export type CandleStickRaw = {
  _id: string;
  symbol: string;
  created_at?: string;
  interval?: string;
  candles: CandleStickItem[];
};

// type IndexLabelData = {
//   a: number;
//   b: number;
//   c: number;
//   d: number;
// }

export type MDCIndexOutput = {
  mdc_index: string;
  color: string;
  time: string;
}

export type FXOutput = {
  bollingerbands?: {
    middle : number,
    upper : number,
    lower : number,
    pb : number
  };
  rsi?: number;
  ma89?: number;
  fx_cases?: string;
  fx_point?: number;
  fx_support_per?: number;
}

type CandleDataItem = CandleStickItem & MDCIndexOutput & FXOutput;
export type CandlesDataType = CandleDataItem[]

export enum PatternName {
  Marubozu = 'Marubozu',
  SpinningTops = 'SpinningTops',

  Hammer = 'Hammer',
  HangingMan = 'HangingMan',

  InvertedHammer = 'InvertedHammer',
  ShootingStar = 'ShootingStar',

  Doji = 'Doji',
  DojiStar = 'DojiStar',
  LongLeggedDoji = 'LongLeggedDoji',
  DragonflyDoji = 'DragonflyDoji',
  GravestoneDoji = 'GravestoneDoji',

  OverSold = 'OverSold',
  OverBought = 'OverBought',

  HigherSoldVolume = 'HigherSoldVolume',
  HigherBoughtVolume = 'HigherBoughtVolume',
  
  SoldVolumePressure = 'SoldVolumePressure',
  BoughtVolumePressure = 'SoldVolumePressure',

  SellingPressure = 'SellingPressure',
  HeavySellingPressure = 'HeavySellingPressure',
  BuyingPressure = 'BuyingPressure',
  HeavyBuyingPressure = 'HeavyBuyingPressure',

  Bearish = 'Bearish',
  Bullish = 'Bullish',

  Red = 'Red',
  Green = 'Green'
}
