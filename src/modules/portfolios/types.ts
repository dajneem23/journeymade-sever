export type AddressSymbolPortfolios = {
  wallet_address: string;
  symbol: string;

  amount: number;
  price: number;
  chain: string;
  usd_value: number;

  dao_id?: string;
  platform_token_id?: string;
  pool_id?: string;
  pool_adapter_id?: string;

  ref_id?: string;
  crawl_time: number;
  updated_at?: string;
  crawl_id?: number;
  source?: string;
}

export enum DATA_SOURCE {
  debank = 'debank',
  binance = 'binance',
  dexscreener = 'dexscreener'
}

export enum CRON_TASK {
  balances = 'debank:balances',
  projects = 'debank:projects'
}

export enum CRON_TASK_STATUS {
  running = 'running',
  done = 'done',
  crashed = 'crashed'
}

export type CronTask = {
  key: string;
  crawl_id: string;
  count: number;
  from_crawl_time?: string;
  to_crawl_time?: string;
  status: CRON_TASK_STATUS,
  details?: any;
}
 export type CronJobProp = {
  crawl_id: number;
  offset: number;
  limit: number;
 }