import { minUSDValue } from '@/configs/vars';
import { groupBy, sortArray, sumArrayByField } from '@/core/utils';
import dayjs from 'dayjs';
import { getTopHolders } from '../debank/services';
import {
  getPortfoliosByWalletAddress
} from '../portfolios/services/getPortfolios';
import { Holder, SegmentIDType, SegmentOptions, SegmentResult } from './types';
import { percentage } from './utils';

const getHotWallets = (holders) => {
  const list = holders.filter((h) => h.percentage_change !== 0);
  if (list.length === 0) return;

  return sortArray(list, 'abs_percentage_change', 'desc')
    .filter((i) => i.abs_percentage_change >= 5)
    .map((h) => {
      return {
        wallet_address: h.wallet_address,
        amount: h.amount,
        percentage_change: h.percentage_change,
      };
    });
};

const updateHolders = ({ current, prev, symbol }) => {
  const groupByAddress = {
    current: groupBy(current, 'wallet_address'),
    prev: groupBy(prev, 'wallet_address'),
  };

  const holders = Object.keys(groupByAddress.current).map((key) => {
    const currentAmount = sumArrayByField(
      groupByAddress.current[key],
      'amount',
    );
    const currentUsdValue = sumArrayByField(
      groupByAddress.current[key],
      'usd_value',
    );
    const prevAmount = groupByAddress.prev[key]
      ? sumArrayByField(groupByAddress.prev[key], 'amount')
      : 1;
    const prevUsdValue = groupByAddress.prev[key]
      ? sumArrayByField(groupByAddress.prev[key], 'usd_value')
      : 1;

    const percentageChange = percentage(currentAmount, prevAmount);
    const usdChange = currentUsdValue - prevUsdValue;
    const usdPercentageChange = percentage(currentUsdValue, prevUsdValue);

    return <Holder>{
      wallet_address: key,
      symbol,
      amount: currentAmount,
      usd_value: currentUsdValue,
      usd_change: usdChange,
      percentage_change: percentageChange,
      abs_percentage_change: Math.abs(percentageChange),
      usd_percentage_change: usdPercentageChange,
      chains: Array.from(
        new Set(
          []
            .concat(current.map((i) => i.chain))
            .concat(prev.map((i) => i.chain)),
        ),
      ).join(','),
    };
  });

  const hot_wallets = getHotWallets(holders);

  return {
    holders,
    hot_wallets,
  };
};

export const getTopHoldersBySymbol = async ({
  symbol,
  current_id,
  prev_id,
}) => {
  return await Promise.all(
    SegmentOptions.map(async ({ id, offset, limit }) => {
      let topHolders;

      try {
        topHolders = await getTopHolders({
          symbol,
          crawl_id: current_id,
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

      if (!topHolders) return;

      const addresses = Array.from(
        new Set(topHolders.map((c) => c.user_address)),
      );

      if (addresses.length === 0) return;

      const current = await getPortfoliosByWalletAddress({
        crawl_id: current_id,
        symbol,
        wallet_addresses: addresses,
      });

      const prev = await getPortfoliosByWalletAddress({
        crawl_id: prev_id,
        symbol,
        wallet_addresses: addresses,
      });

      const currentAddresses = Array.from(
        new Set(current.map((c) => c.wallet_address)),
      );

      const prevAddresses = Array.from(
        new Set(prev.map((c) => c.wallet_address)),
      );

      // console.log(
      //   '🚀 ~ file: topHolders.ts:31 ~ SegmentOptions.map ~ prevAddresses',
      //   symbol,
      //   id,
      //   addresses.length,
      //   current_id,
      //   currentAddresses.length,
      //   prev_id,
      //   prevAddresses.length,
      // );

      if (currentAddresses.length !== prevAddresses.length) return;

      const amount = [
        +sumArrayByField(current, 'amount'),
        +sumArrayByField(prev, 'amount'),
      ];
      const usdValue = [
        +sumArrayByField(current, 'usd_value'),
        +sumArrayByField(prev, 'usd_value'),
      ];

      const percentageChange = percentage(amount[0], amount[1]);
      const usdChange = usdValue[0] - usdValue[1];

      const { holders, hot_wallets } = updateHolders({ current, prev, symbol });

      if (usdChange < minUSDValue) return;

      return <SegmentResult>{
        symbol,
        segment_id: id as SegmentIDType,
        updated_at: dayjs().toISOString(),
        count: limit,
        crawl_id: current_id,
        holders: holders,
        hot_wallets: hot_wallets,

        total_amount: amount[0],
        total_usd_value: usdValue[0],
        percentage_change: percentageChange,
        usd_change: usdChange,
        abs_percentage_change: Math.abs(percentageChange),
      };
    }),
  );
};
