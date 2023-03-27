export interface IPrice {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  id?: String;  // coingecko id
}

export interface IPriceOTD {
  symbol: string;
  from_time: number;
  to_time: number;
  offset?: number;
  limit?: number;  
}