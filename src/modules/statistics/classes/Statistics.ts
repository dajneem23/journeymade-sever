import { sumArrayByField } from '@/core/utils';
import { IPortfolios } from '@/modules/portfolios/types/portfolios.type';
import { EnumStatisticsPeriod } from '../types/enum.type';
import { IStatistics } from '../types/statistics.type';
import { avgValue } from '../utils/avgValue';
import calculatePercentage from '../utils/calculatePercentage';

class Statistics {
  readonly portfolios: Array<IPortfolios>;
  readonly period: EnumStatisticsPeriod;
  readonly from_time: number;
  readonly to_time: number;
  readonly addresses: Array<string>;

  readonly cursor: IPortfolios;

  constructor(portfolios, period_option, addresses = []) {
    const { period, from_time, to_time } = period_option || {};
    this.portfolios = portfolios;
    this.period = period;
    this.from_time = from_time;
    this.to_time = to_time;
    this.addresses = addresses;

    const cursorRaws = addresses?.length > 0
    ? portfolios['0']?.filter((p) => addresses.includes(p.address))
    : portfolios['0'];

    this.cursor = <IPortfolios>{
      amount: +sumArrayByField(cursorRaws, 'amount'),
      usd_value: +sumArrayByField(cursorRaws, 'usd_value'),
    }
  }

  get value(): IStatistics {
    const raw =
      this.addresses?.length > 0
        ? this.portfolios[String(this.period)]?.filter((p) =>
            this.addresses.includes(p.address),
          )
        : this.portfolios[String(this.period)];
    if (!raw || raw.length === 0 || !this.cursor) return;

    const result = <IStatistics>{
      period: this.period,
      amount: +sumArrayByField(raw, 'amount').toFixed(3),
      usd_value: +sumArrayByField(raw, 'usd_value').toFixed(3),
      price: 0,

      from_time: this.from_time,
      to_time: this.to_time,

      percentage_change: null,
      usd_percentage_change: null,
    };

    const price = avgValue(raw, 'price');
    if (price > 0) {
      result['price'] = +price.toFixed(3);
    }

    if (this.period !== 0) {
      result['percentage_change'] = calculatePercentage(
        this.cursor.amount,
        result.amount,
      );
      result['usd_percentage_change'] = calculatePercentage(
        this.cursor.usd_value,
        result.usd_value,
      );
    }

    if (this.addresses?.length === 1) {
      const chains = Array.from(new Set(raw.map((i) => i.chain))).join(',');
      if (chains) result.chains = chains;

      const poolAdapterIds = Array.from(
        new Set(raw.map((i) => i.pool_adapter_id)),
      ).join(',');
      if (poolAdapterIds) result.pool_adapter_ids = poolAdapterIds;
    }

    return result;
  }
}

export default Statistics;
