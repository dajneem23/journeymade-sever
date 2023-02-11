import { groupBy, sortArray, sumArrayByField } from '@/core/utils';
import dayjs from '@/core/utils/dayjs';
import { getTopHoldersBySymbol } from '@/modules/debank/services';
import {
  SegmentIDType,
  SegmentOptions,
  SegmentResult,
  SegmentResults,
  Segments,
} from '@/modules/debank/types';
import { getPortfolioByUserAddress } from '../services/getPortfolioByUserAddress';
import { getTopHoldersTimeFrame } from '../services/getTopHoldersTimeFrame';

const getChangedPercentage = (current, prev, field) => {
  let result = 0;
  if (prev && +prev[field] > 0) {
    result = Number(
      (((+current[field] - +prev[field]) / +prev[field]) * 100).toFixed(3),
    );
  }

  return result;
};

const getHotWallets = (holders) => {
  const list = holders.filter((h) => h.percentage_change !== 0);
  if (list.length === 0) return;
  
  return {
    total_amount: sumArrayByField(list, 'amount'),
    addresses: sortArray(list, 'abs_percentage_change', 'desc').map((h) => [h.user_address, h.percentage_change]),
  };
};

const getNewbieWallets = (holders) => {
  const list = holders.filter((h) => h.is_newbie);
  if (list.length === 0) return;

  return {
    total_amount: sumArrayByField(list, 'amount'),
    addresses: sortArray(list, 'abs_percentage_change', 'desc').map((h) => [h.user_address, h.percentage_change]),
  };
};

const groupSegments = (segments: Segments): SegmentResults => {
  const results = <SegmentResults>[];
  const groups = groupBy(segments, 'segment_id');

  for (const key in groups) {
    const history = sortArray(groups[key], 'crawl_id', 'desc');

    history?.forEach((item, index) => {
      const prev = history.find(
        (e) =>
          e.segment_id === item.segment_id && e.crawl_id === item.crawl_id - 1,
      );
      if (!prev) return;

      if (+prev.total_amount > 0) {
        item.percentage_change = getChangedPercentage(
          item,
          prev,
          'total_amount',
        );
      } else {
        item.percentage_change = 0;
      }

      const { holders } = item;
      const { holders: prevHolders } = history[index + 1];
      holders.map((holder) => {
        const found = prevHolders.find(
          ({ user_address }) => user_address === holder.user_address,
        );
        if (found) {
          holder.percentage_change = getChangedPercentage(
            holder,
            found,
            'amount',
          );

          if (holder.percentage_change !== 0) {
            holder?.portfolios.map((pf) => {
              const foundByChain = found.portfolios?.find(
                ({ chain }) => chain === pf.chain,
              );
              if (foundByChain) {
                pf.percentage_change = getChangedPercentage(
                  pf,
                  foundByChain,
                  'amount',
                );
              } else {
                pf.just_join = true;
              }
            });
          }
        } else {
          holder.is_newbie = true;
        }
      });

      item.hot_wallets = getHotWallets(holders);
      item.newbie_wallets = getNewbieWallets(holders);
    });

    // console.table(history);

    results.push({
      id: key as SegmentIDType,
      history,
    });
  }

  return results;
};

const getData = async (
  { crawl_id, from_time, to_time },
  { segment_id, symbol, offset, limit },
) => {
  const rawHolders = await getTopHoldersBySymbol({
    symbol,
    offset,
    limit,
    crawl_id,
  });
  const addressList = rawHolders.map(({ user_address }) => user_address);

  const portfolios = await getPortfolioByUserAddress({
    symbol,
    user_addresses: addressList,
    min_crawl_time: dayjs(from_time).utc(true).toISOString(),
    max_crawl_time: dayjs(to_time).utc(true).add(50, 'minute').toISOString(),
  });

  // console.log('portfolios.length', portfolios.length);
  if (portfolios.length < addressList.length) {
    console.log(
      'not enough portfolios: ',
      symbol,
      segment_id,
      crawl_id,
      portfolios.length,
      addressList.length,
    );
    return;
  }

  const holders = rawHolders.map((holder) => {
    const pf = portfolios
      .filter((p) => p.user_address === holder.user_address)
      .map(({ is_stable_coin, chain, amount, price, crawl_id, crawl_time }) => {
        return {
          is_stable_coin,
          chain,
          amount: Number(amount),
          price: Number(price),
          crawl_id,
          crawl_time,
        };
      });

    const amount = sumArrayByField(pf, 'amount');
    return {
      user_address: holder.user_address,
      crawl_time: holder.crawl_time,
      updated_at: holder.updated_at,
      portfolios: pf,
      amount: amount,
      amount_diff: Number(holder.amount) - amount,
      usd_value: sumArrayByField(
        pf.map((item) => {
          return { usd_value: Number(item.amount) * Number(item.price) };
        }),
        'usd_value',
      ),
      chains: pf.map(({ chain }) => chain).join(','),
    };
  });

  return {
    segment_id: segment_id,
    crawl_id: Number(crawl_id),
    count: holders.length,
    total_amount: sumArrayByField(holders, 'amount'),
    total_usd_value: sumArrayByField(holders, 'usd_value'),
    updated_at: dayjs(holders[0].updated_at).utc(true).toISOString(),
    crawl_time: dayjs(holders[0].crawl_time).utc(true).toISOString(),
    holders,
  };
};

const topHolders = async ({ symbol }) => {
  const signals = new Array<SegmentResult>();

  const topHoldersTimeFrames = (
    await getTopHoldersTimeFrame({
      symbol,
      limit: 2,
    })
  ).filter((item) => Number(item.count) > 0);

  if (topHoldersTimeFrames.length < 2) return signals;

  const data = [];
  await Promise.all(
    topHoldersTimeFrames.map(
      async ({ crawl_id, from_time, to_time, count }) => {
        await Promise.all(
          SegmentOptions.map(async ({ id, limit, offset }) => {
            if (limit + offset > count) return;

            const raw = await getData(
              { crawl_id, from_time, to_time },
              { segment_id: id, offset, limit, symbol },
            );

            raw && data.push(raw);
          }),
        );
      },
    ),
  );

  // console.log('topHolders', symbol, data.length, data);
  const groups = groupSegments(data);

  groups.forEach((group) => {
    group.history.forEach((item) => {
      const amountChange = Math.abs(item.percentage_change);
      if (0 < amountChange && item.total_amount > 0) {
        signals.push({
          symbol,
          ...item,
        });
      }
    });
  });

  return signals;
};

export default topHolders;
