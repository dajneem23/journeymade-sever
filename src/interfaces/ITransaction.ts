export interface ISendOrReceive {
  amount: number;
  from_addr?: string;
  to_addr?: string;
  price: number;
  token_id?: string;
  token_symbol?: string;
}

export interface ITransaction {
  id: string;
  chain: string;

  from_addr?: string;
  to_addr?: string;
  tokens?: string;

  sends: ISendOrReceive[];
  receives: ISendOrReceive[];

  time_at: number;
  tx?: object;
  updated_at?: number;
}

export interface ITransactionOTD {
  addresses?: string[];
  token_id?: string;
  token_symbol?: string;
  offset: number;
  limit: number;
  from_time?: number;
  to_time?: number;
}