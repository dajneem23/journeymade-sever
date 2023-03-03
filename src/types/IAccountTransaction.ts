export interface ISendOrReceive {
  amount: number;
  from_addr?: string;
  to_addr?: string;
  price: number;
  token_id?: string;
  token_symbol?: string;
}

export interface IAccountTransaction {
  id: string;
  chain: string;
  sends: ISendOrReceive[];
  receives: ISendOrReceive[];

  time_at: number;
  tx?: object;
  updated_at?: number;
}
