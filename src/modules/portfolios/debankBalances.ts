import { CronQueue } from '@/configs/queue';
import {
  getBalancesCrawlId,
  getPortfolioBalancesByCrawlId,
} from '../debank/services';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, CRON_TASK, DATA_SOURCE } from './types';
import { cleanAmount, cleanPrice, prepareOffsets } from './utils';

const getPortfolioBalances = async ({ crawl_id, limit, offset }) => {
  const balances = await getPortfolioBalancesByCrawlId({
    crawl_id,
    limit,
    offset,
  });

  return balances.map(
    (b) =>
      <AddressSymbolPortfolios>{
        wallet_address: b.user_address as string,
        symbol: b.symbol as string,
        amount: cleanAmount(b.amount),
        price: cleanPrice(b.price),
        usd_value: cleanAmount(b.amount) * cleanPrice(b.price),

        chain: b.chain,
        crawl_time: b.crawl_time,
        crawl_id: Number(crawl_id),

        dao_id: null,
        platform_token_id: null,
        pool_id: null,
        pool_adapter_id: null,

        source: DATA_SOURCE.debank,
      },
  );
};

const savePortfolioBalances = async ({ crawl_id, offset, limit }) => {
  const portfolios = await getPortfolioBalances({
    crawl_id,
    offset,
    limit,
  });

  if (portfolios?.length > 0) {
    try {
      savePortfolios(portfolios);
    } catch (e) {
      throw new Error(e);
    }
  }

  return `${crawl_id}: ${offset} - count=${portfolios.length}`;
};

export const initDebankBalancesJobs = async () => {
  const defaultLimit = 1000;
  const crawlIds = await getBalancesCrawlId();

  const jobs = crawlIds.slice(0, 1)
    .map(({ crawl_id, count }) => {
      if (Number(crawl_id) > 2023021501) {
        const offsets = prepareOffsets(Number(count), defaultLimit);
        return offsets.map((offset) => ({
          crawl_id: Number(crawl_id),
          offset,
          limit: defaultLimit,
        }));
      }
    })
    .flat();

  const { addJobs } = CronQueue(CRON_TASK.balances, 'pb', ({ data }) => {
    return savePortfolioBalances(data);
  });

  addJobs(jobs);
};
