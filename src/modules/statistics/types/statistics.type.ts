import { IPortfolios } from "@/modules/portfolios/types/portfolios.type";
import { EnumStatisticsPeriod } from "./enum.type";

export interface IStatistics {
  period: EnumStatisticsPeriod;
  amount: number;
  usd_value: number;
  price: number;
  
  from_time:  number;
  to_time: number;

  percentage_change: number;
  usd_percentage_change: number;

  chains?: string;
  pool_adapter_ids?: string;

  previous_ranking?: number;
};

export type PeriodPortfolios<T> = {
  [K in keyof T]: Array<IPortfolios>;
}[keyof T];
