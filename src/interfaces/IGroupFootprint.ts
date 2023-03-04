export enum EnumGroupFootprintType {
  deposit = 'deposit',
  withdraw = 'withdraw',
}

export interface IGroupFootprint {
  gid: string;
  token: string;

  amount: number; // total amount
  min_price: number;
  max_price: number;

  from_time: number;
  to_time: number;

  type: EnumGroupFootprintType;
}

export interface IGroupFootprintOTD {
  token: string;
  from_time: number;
  to_time: number;
  amount: number;
}