export enum EnumChainNames {
  'evmos' = 'evmos',
  'canto' = 'canto',
  'binance-smart-chain' = 'binance-smart-chain',
  'osmosis' = 'osmosis',

  'avalanche' = 'avalanche',
  'step-network' = 'step-network',
  'defi-kingdoms-blockchain' = 'defi-kingdoms-blockchain',
  'milkomeda-cardano' = 'milkomeda-cardano',
  'polygon-pos' = 'polygon-pos',
  'moonbeam' = 'moonbeam',
  'harmony-shard-0' = 'harmony-shard-0',
  'moonriver' = 'moonriver',

  'ethereum' = 'ethereum',
  'near-protocol' = 'near-protocol',
  'energi' = 'energi',
  'fantom' = 'fantom',
  'sora' = 'sora',
  'arbitrum-one' = 'arbitrum-one',
  'optimistic-ethereum' = 'optimistic-ethereum',
  'huobi-token' = 'huobi-token',
  'xdai' = 'xdai',
}

export interface IToken {
  symbol: string;
  name: string;
  contract_ids: Record<EnumChainNames, string>;
}
