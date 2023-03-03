import { getTopHolders } from '@/modules/_temp/debank/services';
import { getPortfoliosByWalletAddress } from '@/modules/_temp/portfolios/services/getPortfolios';
import prepareCrawlIds from '../../utils/prepareCrawlIds';
import getStatistics from './getStatistics';
import { GroupHolders } from '../../types';

const getUniqueAddressList = async ({
  id,
  symbol,
  crawl_id,
  limit,
  offset,
}) => {
  let holders;
  try {
    holders = await getTopHolders({
      symbol,
      crawl_id,
      limit,
      offset,
    });
  } catch (e) {
    console.log(
      '🚀 ~ file: topHolders.ts:131 ~ SegmentOptions.map ~ e',
      id,
      symbol,
      offset,
      limit,
      e,
    );
  }

  if (!holders || holders.length === 0) return [];

  return Array.from(new Set(holders.map((c) => c.user_address as string)));
};

export const updateGroupHolders = async ({
  symbol,
  id,
  offset,
  limit,
  crawl_id,
}) => {
  const addresses = await getUniqueAddressList({
    id,
    symbol,
    crawl_id,
    limit,
    offset,
  });

  if (addresses.length === 0) return;

  const crawlIds = prepareCrawlIds({ crawl_id });

  const portfolios = {};
  await Promise.all(
    crawlIds.map(async ({ crawl_id: cid, period }) => {
      portfolios[period] = await getPortfoliosByWalletAddress({
        crawl_id: cid,
        symbol,
        wallet_addresses: addresses,
      });
    }),
  );

  // console.log('portfolios', JSON.stringify(portfolios));

  const statistics = getStatistics({
    portfolios,
    crawl_ids: crawlIds,
    filter: {},
  });

  const holders = addresses.map((wallet_address) => {
    return {
      wallet_address,
      statistics: getStatistics({
        portfolios,
        crawl_ids: crawlIds,
        filter: {
          address: `${wallet_address}`,
        },
      }),
    };
  });

  // console.log(
  //   '🚀 ~ file: updateGroupHolders.ts:82 ~ statistics:',
  //   JSON.stringify({
  //     id,
  //     count: addresses.length,
  //     statistics,
  //     holders,
  //   }),
  // );

  return <GroupHolders>{
    id,
    symbol,
    crawl_id,
    count: addresses.length,
    statistics,
    holders,
  };
};
