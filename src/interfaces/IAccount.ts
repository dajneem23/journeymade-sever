export interface IAccount {
  address: string,
  tokens: string,
  chains: string,
  tags: string,
}

export interface IAccountGetDTO {
  addresses: string[],
  tokens: string[],
  tags: string[],
  offset: number,
  limit: number,
}