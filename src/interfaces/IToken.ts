export interface IToken {
  id: String;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  coingeckoId: string;
  listedIn: string[];
}
export interface ITokenOTD {
  symbols: string[];
  offset: number;
  limit: number;
}

export interface ITokenResponse {
  id: string;
  symbol: string;
  name: string;
  coingeckoId: string;
  logoURI: string;

  chains: string[];
  addresses: string[];
}


export interface ITokenDetailResponse {
  id: string;
  symbol: string;
  name: string;
  coingeckoId: string;
  logoURI: string;

  chains: {
    id: number;
    address: string;
    decimals: number;
    listedIn?: string[];
  }[];

  circulatingSupply?: number;
  totalSupply?: number;

  dailyVolume?: number;
  total24hVolume?: number;
  totalAllTime?: number;
}

export interface ITokenHolderStatsResponse {
  name: string,
  count: number,
  volume: number,
}

export interface ITokenSignalResponse {
  title: string;
  description?: string;
  from_time: number;
  to_time: number;
  period?: string;
  holders?: ITokenHolderStatsResponse[];
  lead_zone?: {
    tags?: string[],
    address?: string,
  }
}
