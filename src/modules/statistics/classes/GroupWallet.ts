import { PeriodPortfolios } from '../types/statistics.type';
import prepareCrawlIds from '../utils/prepareCrawlIds';
import Statistics from './Statistics';
import Wallet from './Wallet';

interface IGroupWalletFilters {
  symbol?: string;
  cid: number;
}

class GroupWallet {
  readonly id: string;
  readonly creator: string;
  readonly addresses: Array<string>;

  readonly filters: IGroupWalletFilters;
  readonly period_options: Array<{
    crawl_id: number;
    period: number;
    from_time: number;
    to_time: number;
  }>;

  readonly portfolios: PeriodPortfolios<string>;

  constructor({ id, creator, addresses, portfolios, filters }) {
    this.id = id;
    this.creator = creator;
    this.addresses = addresses;
    this.filters = filters;

    this.period_options = prepareCrawlIds({ crawl_id: filters.cid });
    this.portfolios = this.filterPortfolios(
      filters.symbol,
      addresses,
      portfolios,
    );
  }

  filterPortfolios(symbol, addresses, data) {
    const result = <PeriodPortfolios<string>>{};
    Object.keys(data).forEach((key) => {
      result[key] = data[key].filter(({ address, symbol: s }) => {
        if (!symbol) return addresses.includes(address);

        return addresses.includes(address) && symbol === s;
      });
    });
    return result;
  }

  statistics() {
    return this.period_options
      .map(({ period, from_time, to_time }) => {
        return new Statistics(this.portfolios, { period, from_time, to_time })
          .value;
      })
      .filter((o) => !!o);
  }

  wallets() {
    return this.addresses
      .map((address) => {
        return new Wallet({
          address,
          portfolios: this.portfolios,
          period_options: this.period_options,
        }).value;
      })
      .filter((o) => !!o);
  }

  get value() {
    return {
      id: this.id,
      ...this.filters,
      creator: this.creator,      
      address_count: this.addresses.length,
      statistics: this.statistics(),
      wallets: this.wallets(),
    };
  }
}

export default GroupWallet;
