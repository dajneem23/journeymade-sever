import {
  countPortfolioProjectsByCrawlId,
  getPortfolioProjectsByCrawlId,
} from '../debank/services';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios, DATA_SOURCE } from './types';
import { cleanAmount, cleanPrice, prepareOffsets } from './utils';

const getPortfoliosProjects = async ({ crawl_id, limit, offset }) => {
  const raws = await getPortfolioProjectsByCrawlId({
    crawl_id,
    limit,
    offset,
  });

  const results = [];

  raws.forEach(({ user_address, details, crawl_time, crawl_id }) => {
    const {
      dao_id,
      platform_token_id,
      portfolio_item_list = [],
    } = details || {};
    return portfolio_item_list.forEach((item) =>
      item.asset_token_list?.forEach((t) => {
        results.push(<AddressSymbolPortfolios>{
          wallet_address: user_address,
          symbol: t.symbol,
          amount: cleanAmount(t.amount),
          price: cleanPrice(t.price),
          chain: t.chain,

          dao_id: dao_id,
          platform_token_id: platform_token_id,
          pool_id: item.pool?.id,
          pool_adapter_id: item.pool?.adapter_id,

          crawl_time: crawl_time,
          crawl_id: Number(crawl_id),
          source: DATA_SOURCE.debank,
        });
      }),
    );
  });

  return results;
};

export const savePortfolioProjects = async ({ crawl_id, count }) => {
  const defaultLimit = 300;

  const tasks = {
    count: 0,
    done: 0,
  };

  const process = async ({ offset, limit }) => {
    const portfolios = await getPortfoliosProjects({
      crawl_id,
      offset,
      limit,
    });

    if (portfolios?.length > 0) {
      await savePortfolios(portfolios).then(() => {
        const length = portfolios.length;
        tasks.done += 1;

        console.log(
          `bulk: crawl_id: ${crawl_id}, offset: ${offset}, count: ${length}, progress: ${tasks.done}/${tasks.count}`,
        );
      });
    }
  };

  let rowCount = count;
  if (!rowCount) {
    rowCount = await countPortfolioProjectsByCrawlId({
      crawl_id,
    });
  }

  const offsets = prepareOffsets(rowCount, defaultLimit);
  tasks.count = offsets.length;

  await Promise.all(
    offsets.map(async (offset) => {
      await process({ offset, limit: defaultLimit });
    }),
  );
};
