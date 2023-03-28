export interface IPrice {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  id?: String;  // coingecko id
}

export interface IPriceOTD {
  token_id: string;
  from_time: number;
  to_time: number;
  offset?: number;
  limit?: number;  
}