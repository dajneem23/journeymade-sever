export enum SegmentID {
  offset_0_50 = 'top_50',
  offset_50_150 = 'top_50_150',
  offset_150_300 = 'top_150_300',
  offset_300_450 = 'top_300_450',
  offset_450_600 = 'top_450_600',
  offset_600_750 = 'top_600_750',
  offset_750_1000 = 'top_750_1000',
}

export enum GroupID {
  CryptoExchanges = 'CE',
  SmartContract = 'SC',
  SmartMoney = 'SM',
  MarketMaker = 'MM',
  Whale = 'W',
}

export const SegmentOptions = [
  {
    id: SegmentID.offset_0_50,
    offset: 0,
    limit: 50,
  },
  {
    id: SegmentID.offset_50_150,
    offset: 50,
    limit: 100,
  },
  {
    id: SegmentID.offset_150_300,
    offset: 150,
    limit: 150,
  },
  {
    id: SegmentID.offset_300_450,
    offset: 300,
    limit: 150,
  },
  {
    id: SegmentID.offset_450_600,
    offset: 450,
    limit: 150,
  },
  {
    id: SegmentID.offset_600_750,
    offset: 600,
    limit: 150,
  },
  {
    id: SegmentID.offset_750_1000,
    offset: 750,
    limit: 150,
  },
];

export type SegmentIDType =
  | SegmentID.offset_0_50
  | SegmentID.offset_50_150
  | SegmentID.offset_150_300
  | SegmentID.offset_300_450
  | SegmentID.offset_450_600
  | SegmentID.offset_600_750
  | SegmentID.offset_750_1000;

export type GroupIDType =
  | GroupID.CryptoExchanges
  | GroupID.SmartContract
  | GroupID.SmartMoney
  | GroupID.MarketMaker
  | GroupID.Whale;

export type SegmentResult = {
  id: SegmentIDType;
  count: number;

  min_price?: number;
  max_price?: number;

  amount: number;
  percentage_change?: number; // + increase, - decrease
  abs_percentage_change?: number;

  usd_value: number;
  usd_change?: number; // + increase, - decrease
  usd_percentage_change?: number; // + increase, - decrease
  abs_usd_percentage_change?: number;

  holders: Holder[];
  hot_wallets: any[];

  updated_at?: string;
};

export enum StatisticsPeriod {
  'cursor' = 0,
  '3H' = 3,
  '6H' = 6,
  '12H' = 12,
  '24H' = 24,
  '7D' = 168,
  '30D' = 720,
  '60D' = 1440,
}

export const periodOptions = [
  StatisticsPeriod['cursor'],
  StatisticsPeriod['3H'],
  StatisticsPeriod['6H'],
  StatisticsPeriod['12H'],
  StatisticsPeriod['24H'],
  StatisticsPeriod['7D'],
  StatisticsPeriod['30D'],
  StatisticsPeriod['60D'],
];

export type HolderStatistics = {
  period: StatisticsPeriod;
  previous_ranking?: number;
  percentage_change: number;
  usd_percentage_change: number;
  amount?: number;
  usd_value?: number;
};

export type Holder = {
  wallet_address: string;

  amount: number;
  percentage_change?: number; // + increase, - decrease
  abs_percentage_change?: number;

  usd_value: number;
  usd_change?: number;
  usd_percentage_change?: number;
  abs_usd_percentage_change?: number;

  chains?: string;
  pool_adapter_ids?: string;

  ranking?: number;
  statistics: HolderStatistics[];
};

export type HotWallets = {
  wallet_address: string;
  amount: number;
  percentage_change?: number; // + increase, - decrease
  usd_value: number;
  usd_change?: number;
};

export type GroupResult = {
  id: GroupIDType;
  count: number;

  min_price?: number;
  max_price?: number;

  amount: number;
  percentage_change?: number; // + increase, - decrease
  abs_percentage_change?: number;

  usd_value: number;
  usd_change?: number; // + increase, - decrease
  usd_percentage_change?: number; // + increase, - decrease
  abs_usd_percentage_change?: number;

  holders: Holder[];
  hot_wallets: any[];

  updated_at?: string;
};

export type Output = {
  symbol: string;
  crawl_id: number;
} & (SegmentResult | GroupResult);

export enum CRON_TASK {
  top_holders = 'statistics:top_holders',
}

export type Statistics = {
  period: StatisticsPeriod;
  amount?: number;
  usd_value?: number;

  percentage_change: number;
  usd_percentage_change: number;
  previous_ranking?: number;
};

export type GroupHolders = {
  id: string;
  symbol: string;
  crawl_id: number;
  count: number;
  statistics: Statistics[];
  holders: ({
    wallet_address: string;
    statistics: Statistics[]
  })[];
};
