import {
  countPortfolioBalancesByCrawlId,
  getPortfolioBalancesByCrawlId,
} from '../debank/services';
import PortfolioAdapter from './adapter';
import { DATA_SOURCE } from './types/enum.type';
import { IPortfolios } from './types/portfolios.type';
import { RawBalancesType } from './types/rawBalances.type';
import { toTimestamp } from './utils';
import { cleanAmount, cleanPrice } from './utils/parseNumber';

class BalancesAdapter extends PortfolioAdapter {
  constructor() {
    super({
      id: DATA_SOURCE.DEBANK_BALANCES,
      raw_limit: 300,
      count_function: countPortfolioBalancesByCrawlId,
    });
  }

  async jobHandler({ data }): Promise<string> {
    const { crawl_id, limit, offset } = data || {};
    if (!crawl_id || !limit) return;

    let balances: RawBalancesType[] = [];
    try {
      balances = await getPortfolioBalancesByCrawlId({
        crawl_id,
        limit,
        offset,
      });
    } catch (e) {
      throw new Error(e);
    }

    if (!balances || balances.length === 0) return;

    const portfolios = balances.map((b: RawBalancesType) => {
      return <IPortfolios>{
        address: b.user_address as string,
        ref_id: this.generateRefId([crawl_id, b.symbol]),
        cid: +crawl_id,

        symbol: b.symbol as string,
        amount: cleanAmount(b.amount),
        price: cleanPrice(b.price),
        usd_value: cleanAmount(+b.amount * +b.price),

        chain: b.chain as string,
        ctime: toTimestamp(b.crawl_time),
      };
    });

    return await this.saveData({
      crawl_id,
      offset,
      portfolios,
    });
  }
}

export default BalancesAdapter;
