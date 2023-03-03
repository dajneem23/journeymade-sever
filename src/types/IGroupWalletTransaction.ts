export enum EnumGroupWallerTransactionType {
  deposit = 'deposit',
  withdraw = 'withdraw',
}

export interface IGroupWallerTransaction {
  gw_id: string;
  token: string;

  amount: number; // total amount
  min_price: number;
  max_price: number;

  from_time: number;
  to_time: number;

  type: EnumGroupWallerTransactionType;
}
