import { getTopHolders } from '@/modules/_temp/debank/services';
import {
  getPortfoliosByAddresses
} from '@/modules/_temp/portfolios/services/getPortfolios';
import GroupWallet from '../classes/GroupWallet';
import { Creator } from '../types/enum.type';
import { PeriodPortfolios } from '../types/statistics.type';
import prepareCrawlIds from '../utils/prepareCrawlIds';

interface ITopHoldersFilters {
  symbol: string;
  crawl_id: number;
  limit: number;
  offset: number;
}

class TopHolders {
  readonly id: string;

  readonly filters: ITopHoldersFilters;
  readonly period_options: Array<{
    crawl_id: number;
    period: number;
    from_time: number;
    to_time: number;
  }>;

  addresses: Array<string>;
  portfolios: PeriodPortfolios<string>;

  constructor(id, filters: ITopHoldersFilters) {
    this.id = id;
    this.filters = filters;

    this.period_options = prepareCrawlIds({ crawl_id: filters.crawl_id });
  }

  async getAddresses() {
    const { symbol, crawl_id, limit, offset } = this.filters;
    try {
      const holders = await getTopHolders({
        symbol,
        crawl_id,
        limit,
        offset,
      });

      this.addresses =
        !holders || holders.length === 0
          ? []
          : Array.from(new Set(holders.map((c) => c.user_address as string)));
    } catch (e) {
      console.log(
        '🚀 ~ file: TopHolders.ts:46 ~ TopHolders ~ getAddresses ~ e:',
        e,
      );
    }
  }

  async getPortfolios() {
    const portfolios = <PeriodPortfolios<string>>{};
    await Promise.all(
      this.period_options.map(async ({ crawl_id, period }) => {
        portfolios[period] = await getPortfoliosByAddresses({
          symbol: this.filters.symbol,
          crawl_date: String(crawl_id).substring(0, 8),
          cid: crawl_id,
          addresses: this.addresses,
        });
      }),
    );

    this.portfolios = portfolios;
  }

  async process() {
    await this.getAddresses();
    await this.getPortfolios();

    const groupWallet = new GroupWallet({
      id: this.id,
      creator: Creator.admin,
      addresses: this.addresses,
      filters: {
        symbol: this.filters.symbol,
        cid: this.filters.crawl_id,
      },
      portfolios: this.portfolios,
    });

    return groupWallet.value;
  }
}

export default TopHolders;
