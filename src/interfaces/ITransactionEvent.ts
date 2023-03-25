enum ETransactionEventType {
  send = 'send',
  receive = 'receive',
}

enum EAccountType {
  eoa = 'eoa',  // Externally-owned account
  smart_contract = 'smart_contract',

  liquidity_pool = 'liquidity_pool',
  deposit = 'deposit',
  farming = 'farming',
  governance = 'governance',
  insurance_buyer = 'Insurance Buyer',
  investment = 'investment',
  lending = 'lending',
  leveraged_farming = 'leveraged_farming',
  locked = 'locked',
  nft_fraction = 'nft_fraction',
  nft_lending = 'nft_lending',
  nft_liquidity_pool = 'nft_liquidity_pool',
  nft_staked = 'nft_staked',
  options_buyer = 'options_buyer',
  options_seller = 'options_seller',
  perpetuals = 'perpetuals',
  rewards = 'rewards',
  staked = 'staked',
  vesting = 'vesting',
  yield = 'yield',
  unknown = 'unknown',
}

export interface ITransactionEvent {
  tx_hash: string;
  log_index: number; // <logIndex>

  block_number?: number;
  block_at?: number;

  token: string;  // token address
  symbol?: string; // token symbol

  from_account: string;  // from account
  from_account_type?: EAccountType;
  from_account_tags?: string[];  //

  to_account: string;  // to account
  to_account_type?: EAccountType;
  to_account_tags?: string[];  //

  amount: number;
  usd_value?: number;
  price?: number;
  decimals?: number;
  price_at?: number;

  chain: string;
  chain_id?: number;
}
