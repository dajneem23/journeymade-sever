export enum SegmentID {
  offset_0_50 = 'offset_0_50',
  offset_50_150 = 'offset_50_150',
  offset_150_500 = 'offset_150_500',
  offset_500_1000 = 'offset_500_1000'
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
    limit: 150
  },
  {
    id: SegmentID.offset_150_500,
    offset: 150,
    limit: 500
  },
  {
    id: SegmentID.offset_150_500,
    offset: 150,
    limit: 500
  },
  {
    id: SegmentID.offset_500_1000,
    offset: 500,
    limit: 1000
  },
];
  
export type SegmentIDType =
  | SegmentID.offset_0_50
  | SegmentID.offset_50_150
  | SegmentID.offset_150_500;

export type Portfolio = {
  user_address: string;
  symbol: string;
  chain: string;
  amount: number;
  price: number;
  decimals: number;

  is_wallet: boolean;
  is_stable_coin: boolean;
  updated_at: string;
  crawl_id: number;
};

export type Segment = {
  id: SegmentIDType;

  count: number;
  avg_balance: number;

  updated_at: string;
  crawl_id: number;

  addresses: string[];
};

export type Segments = Segment[];

export type SegmentResult = {
  segment_id?: SegmentIDType;
  updated_at: string;
  count: number;
  crawl_id: number;
  addresses: string[];

  avg_balance: number;
  symbol?: string;
  percentage_change?: number; // + increase, - decrease
};

export type SegmentResults = {
  id: SegmentIDType;
  history: SegmentResult[];
}[];
