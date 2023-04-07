export interface IAccountSnapshot {
  address: string,
  balance_list: any[],
  project_list: any[],
  stats?: {
    total_balance_usd_value?: number,
    total_project_usd_value?: number,
    total_project_net_value?: number,
    total_project_debt_value?: number,
    total_usd_value?: number,
    total_net_usd_value?: number,
  },
  tags?: string[],
  labels?: string[],
  crawl_time: string,
}
