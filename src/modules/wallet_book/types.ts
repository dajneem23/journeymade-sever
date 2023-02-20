export type WalletInfo = {
  address: string;
  labels: string[];
  tags: string[];
  tokens: string[];
}

export enum Tags {
  CryptoExchanges = 'CE',
  SmartContract = 'SC',
  SmartMoney = 'SM',
  MarketMaker = 'MM',
  Whale = 'W',
  TopHolders = 'TH'
}

