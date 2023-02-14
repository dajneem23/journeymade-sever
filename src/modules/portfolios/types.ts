export type AddressSymbolPortfolios = {
  wallet_address: string;
  symbol: string;

  amount: number;
  price: number;
  chain: string;

  dao_id?: string;
  platform_token_id?: string;
  pool_id?: string;
  pool_adapter_id?: string;

  crawl_time: string;
  updated_at?: string;
  crawl_id?: number;
}

// {
//   user_address: '0x82794da0d1e3d01e190cc59537ac36ba6bfa1415',
//   updated_at: 2023-02-13T17:15:19.588Z,
//   is_stable_coin: false,
//   amount: '0.000003045767345066',
//   chain: 'doge',
//   price: '292.8',
//   crawl_id: '2023021401',
//   crawl_time: 2023-02-13T17:15:19.566Z,
//   symbol: 'BNB'
// },