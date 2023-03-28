export enum EnumTagType {
  category = 'category',
  token = 'token',
  platform = 'platform',
  chain = 'chain',
  protocol = 'protocol',
}

export enum EAccountTags {
  CryptoExchanges = 'CE',
  SmartContract = 'SC',
  SmartMoney = 'SM',
  MarketMaker = 'MM',  
  TopHolders = 'TH',

  HighActivity = 'HA',
  HighBalance = 'HB',
  
  Bot = 'BOT',

  Investor = 'VC',
  Capital = 'VC',

  Binance = 'BINANCE',
  Gate = 'GATE',

  Whale = 'WHALE',
  Millionaire = 'WHALE',
}

export interface ITag {
  id: string,
  name: string,
  description: string,
  type: EnumTagType,
}

export interface ITagOTD {
  ids?: string[],
  offset: number,
  limit: number
}