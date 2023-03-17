export enum EnumTagType {
  category = 'category',
  token = 'token',
  platform = 'platform',
  chain = 'chain',
  protocol = 'protocol',
}

export interface ITag {
  id: string,
  name: string,
  description: string,
  type: EnumTagType,
}

export interface ITagOTD {
  ids?: string[],
  offset: number,
  limit: number
}