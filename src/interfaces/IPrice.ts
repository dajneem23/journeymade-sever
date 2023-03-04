export interface IPrice {
  symbol: string;
  price: number;
  time_at: number;
  volume?: number;
}

export interface IPriceOTD {
  symbol: string;
  from_time: number;
  to_time: number;
  offset: number;
  limit: number;  
}