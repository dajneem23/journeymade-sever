import { nodeEnv } from '@/configs/vars';
import { resolvePromisesSeq } from '@/core/utils';
import schedule from 'node-schedule';
import {
  countPortfolioBalancesBySymbolCrawlId,
  countPortfolioProjectsByCrawlId,
  getCoinList,
  getLastCrawlID,
  getPortfolioBalancesBySymbolCrawlId,
  getPortfolioProjectsByCrawlId,
} from '../debank/services';
import { savePortfolios } from './services/savePortfolios';
import { AddressSymbolPortfolios } from './types';

const cleanAmount = (amount) => {
  return Number(amount);
};

const cleanPrice = (price) => {
  return Number(price);
};

const getPortfolios = async ({ crawl_id, symbol, limit, offset }) => {
  const balances = await getPortfolioBalancesBySymbolCrawlId({
    crawl_id,
    symbol,
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
        chain: b.chain,
        crawl_time: b.crawl_time,
        crawl_id: Number(crawl_id),

        dao_id: null,
        platform_token_id: null,
        pool_id: null,
        pool_adapter_id: null,
      },
  );
};

const getPortfoliosFromProjects = async ({ crawl_id, limit, offset }) => {
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
        });
      }),
    );
  });

  return results;
};

const getOffsets = (max, limit) => {
  const offsets = [];
  for (let i = 0; i < Math.round(Number(max) / limit) * limit; i += limit) {
    offsets.push(i);
  }
  return offsets;
};

const savePortfolioBalances = async ({ symbols = [], crawl_id }) => {
  const defaultLimit = 300;
  const tasks = {
    count: 0,
    done: 0,
  };

  const process = async ({ symbol, offset, limit }) => {
    const portfolios = await getPortfolios({
      crawl_id,
      symbol,
      offset,
      limit,
    });

    if (portfolios?.length > 0) {
      await savePortfolios(portfolios).then(() => {
        tasks.done += 1;

        console.log(
          `bulk: crawl_id: ${crawl_id}, symbol: ${symbol}, offset: ${offset}, count: ${portfolios.length}, progress: ${tasks.done}/${tasks.count}`,
        );
      });
    }
  };

  await Promise.all(
    symbols.map(async (symbol) => {
      const count = await countPortfolioBalancesBySymbolCrawlId({
        crawl_id,
        symbol,
      });

      const offsets = getOffsets(count, defaultLimit);
      tasks.count += offsets.length;

      return await Promise.all(
        offsets.map(async (offset) => {
          await process({ symbol, offset, limit: defaultLimit });
        }),
      );
    }),
  );
};

const savePortfolioProjects = async ({ crawl_id }) => {
  const defaultLimit = 100;

  const tasks = {
    count: 0,
    done: 0,
  };

  const process = async ({ offset, limit }) => {
    const portfolios = await getPortfoliosFromProjects({
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

  const count = await countPortfolioProjectsByCrawlId({
    crawl_id,
  });
  const offsets = getOffsets(count, defaultLimit);
  tasks.count = offsets.length;

  await Promise.all(
    offsets.map(async (offset) => {
      await process({ offset, limit: defaultLimit });
    }),
  );
};

export default async () => {
  console.log('🚀 ~ file: index.ts:9 ~ nodeEnv', nodeEnv);

  if (nodeEnv !== 'production') {
    init();
  } else {
    schedule.scheduleJob('30 * * * *', async function () {
      init();
    });
  }

  async function init() {
    const crawlId = await getLastCrawlID();
    const symbols = await getCoinList();

    await savePortfolioBalances({ symbols, crawl_id: crawlId });

    await savePortfolioProjects({ crawl_id: crawlId });

    // console.log('done!!!');
  }
};
