export enum SegmentID {
  offset_0_50 = 'offset_0_50',
  offset_50_150 = 'offset_50_150',
  offset_150_300 = 'offset_150_300',
  offset_300_450 = 'offset_300_450',
  offset_450_600 = 'offset_450_600',
  offset_600_750 = 'offset_600_750',
  offset_750_1000 = 'offset_750_1000'
}

export const SegmentOptions = [
  {
    id: SegmentID.offset_0_50,
    offset: 0,
    limit: 50
  },
  {
    id: SegmentID.offset_50_150,
    offset: 50,
    limit: 100
  },
  {
    id: SegmentID.offset_150_300,
    offset: 150,
    limit: 150
  },
  {
    id: SegmentID.offset_300_450,
    offset: 300,
    limit: 150
  },
  {
    id: SegmentID.offset_450_600,
    offset: 450,
    limit: 150
  },
  {
    id: SegmentID.offset_600_750,
    offset: 600,
    limit: 150
  },
  {
    id: SegmentID.offset_750_1000,
    offset: 750,
    limit: 150
  },
];
  
export type SegmentIDType =
  | SegmentID.offset_0_50
  | SegmentID.offset_50_150
  | SegmentID.offset_150_300
  | SegmentID.offset_300_450
  | SegmentID.offset_450_600
  | SegmentID.offset_600_750
  | SegmentID.offset_750_1000

export type SegmentResult = {
  segment_id?: SegmentIDType;
  updated_at: string;
  count: number;
  crawl_id: number;
  crawl_time?: string;

  holders: any[];
  hot_wallets: any[];

  total_amount: number;
  total_usd_value?: number;
  symbol?: string;
  percentage_change?: number; // + increase, - decrease
  usd_change?: number; // + increase, - decrease
  abs_percentage_change?: number; 
};

export type Holder = {
  wallet_address: string;
  symbol: string;
  amount: number;
  usd_value: number;
  usd_change?: number;
  percentage_change?: number; // + increase, - decrease
  abs_percentage_change?: number;
  usd_percentage_change?: number;
}