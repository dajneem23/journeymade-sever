export interface IDebankHolder {
  user_address: string;
  details: any;
}

export interface IDebankTopHolders {
  id: string;
  addresses: string[];
  holders: IDebankHolder[];
}
