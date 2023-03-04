export interface IGroup {
  id: string;
  name: string;
  description: string;
  token: string;
  tags: string[];
  members: string[];
}

export interface IGroupOTD {
  ids: string[];
  tokens: string[];
  tags: string[];
  offset: number;
  limit: number;
}