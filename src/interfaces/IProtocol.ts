interface DepositTopCoin {
  amount: number;
  id: string;
  logo_url: string;
  price: number;
  rate: number;
  symbol: string;
  usd_value: number;
}

interface PoolStat {
  count: number;
  name: string;
  rate: number;
  usd_value: number;
}

interface Stats {
  chain_id: string;
  deposit_top_coins: DepositTopCoin[];
  deposit_top_tokens: any[];
  deposit_usd_value: number;
  deposit_user_count: number;
  deposit_valuable_user_count: number;
  id: string;
  pool_stats: PoolStat[];
}

export interface IProtocol {
  chain: string;
  dao_id?: any;
  has_supported_portfolio: boolean;
  id: string;
  is_tvl: boolean;
  is_visible_in_defi?: any;
  logo_url: string;
  name: string;
  platform_token_chain: string;
  platform_token_id: string;
  platform_token_logo?: any;
  platform_token_symbol?: any;
  site_url: string;
  stats: Stats;
  tag_ids: string[];
  tvl: number;
}
