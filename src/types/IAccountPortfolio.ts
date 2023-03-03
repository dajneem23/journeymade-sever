export interface IAccountPortfolio {
  address: string;

  ref_id: string; // raw data id
  cid: number; // crawl_id, indexed

  symbol: string;
  amount: number;
  price: number;
  usd_value: number;
  chain: string;

  dao_id?: string;
  pool_id?: string;
  pool_adp_id?: string; // pool_adapter_id
  pf_token_id?: string; // platform_token_id

  ctime: number; // crawl_time
  source?: string;
  
  updated_at?: number;
}
