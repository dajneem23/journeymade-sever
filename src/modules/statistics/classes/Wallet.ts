import Statistics from './Statistics';

class Wallet {
  readonly address: string;
  readonly period_options: Array<{
    crawl_id: number;
    period: number;
    from_time: number;
    to_time: number;
  }>;

  readonly portfolios: object;

  constructor({ address, portfolios, period_options }) {
    this.address = address;
    this.portfolios = portfolios;
    this.period_options = period_options;
  }

  statistics() {
    return this.period_options.map(({ period, from_time, to_time }) => {
      return new Statistics(
        this.portfolios,
        { period, from_time, to_time },
        [this.address]
      ).value;
    }).filter(o => !!o);
  }

  get value() {
    return {
      address: this.address,
      statistics: this.statistics()
    }
  }
}

export default Wallet;
