export enum EnumTagSource {
  debank = 'debank',
  nansen = 'nansen'
}

export interface ITag {
  id: string,
  name: string,
  description: string,
  source: EnumTagSource,
  volume: number
}

export interface ITagOTD {
  ids?: string[],
  offset: number,
  limit: number
}