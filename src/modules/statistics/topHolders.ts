import { CronQueue } from '@/configs/queue';
import { groupBy, sumArrayByField } from '@/core/utils';
import cronLog from '@/modules/cron_logs';
import schedule from 'node-schedule';
import { getCoinList, getTopHolders } from '../debank/services';
import { getPortfoliosByWalletAddress } from '../portfolios/services/getPortfolios';
import { getAddressBookByAddresses } from '../wallet_book/services/getByAddress';
import { saveTopHoldersStatistics } from './services/saveTopHoldersStatistics';
import { Holder, Output, SegmentOptions, SegmentResult } from './types';
import { percentage } from './utils';

const getHotWallets = async (holders) => {
  const addresses = holders
    .filter((h) => h.abs_percentage_change !== 0)
    .map((h) => h.wallet_address);
  const addressBook = await getAddressBookByAddresses({
    wallet_addresses: addresses,
  });

  const result = addresses.map((address) => {
    const found = addressBook.find(({ address: _id }) => {
      _id === address;
    });

    if (found) {
      console.log('found', found)
    }

    const res = { address }
    if (found?.tags?.length > 0) res['tags'] = found?.tags?.join(',');
    if (found?.labels?.length > 0) res['labels'] = found?.labels?.join(',');

    return res
  });

  return result;
};

const updateHolders = async ({ current, prev }) => {
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

      amount: currentAmount,
      percentage_change: percentageChange,
      abs_percentage_change: Math.abs(percentageChange),

      usd_value: currentUsdValue,
      usd_change: usdChange,
      usd_percentage_change: usdPercentageChange,
      abs_usd_percentage_change: Math.abs(usdPercentageChange),

      chains: Array.from(
        new Set(
          []
            .concat(current.map((i) => i.chain))
            .concat(prev.map((i) => i.chain)),
        ),
      ).join(','),
      pool_adapter_ids: Array.from(
        new Set(
          []
            .concat(current.map((i) => i.pool_adapter_id))
            .concat(prev.map((i) => i.pool_adapter_id)),
        ),
      ).join(','),
    };
  });

  const hot_wallets = await getHotWallets(holders);

  return {
    holders,
    hot_wallets,
  };
};

const processSegment = async ({
  symbol,
  segment: { id, offset, limit },
  crawl_ids: { current: current_id, previous: previous_id },
}) => {
  let holders;
  try {
    holders = await getTopHolders({
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
  if (!holders) return;

  const addresses = Array.from(new Set(holders.map((c) => c.user_address)));
  if (addresses.length === 0) return;

  const portfolios = {
    current: await getPortfoliosByWalletAddress({
      crawl_id: current_id,
      symbol,
      wallet_addresses: addresses,
    }),
    previous: await getPortfoliosByWalletAddress({
      crawl_id: previous_id,
      symbol,
      wallet_addresses: addresses,
    }),
  };
  const address = {
    current: Array.from(
      new Set(portfolios.current.map((c) => c.wallet_address)),
    ),
    previous: Array.from(
      new Set(portfolios.previous.map((c) => c.wallet_address)),
    ),
  };

  const fromTime = Math.min(...portfolios.current.map((c) => c.crawl_time));
  const toTime = Math.max(...portfolios.current.map((c) => c.crawl_time));

  const minPrice = Math.min(...portfolios.current.map((c) => c.price));
  const maxPrice = Math.max(...portfolios.current.map((c) => c.price));

  const amount = [
    +sumArrayByField(portfolios.current, 'amount'),
    +sumArrayByField(portfolios.previous, 'amount'),
  ];
  const usdValue = [
    +sumArrayByField(portfolios.current, 'usd_value'),
    +sumArrayByField(portfolios.previous, 'usd_value'),
  ];

  const percentageChange = percentage(amount[0], amount[1]);
  const usdChange = usdValue[0] - usdValue[1];
  const usdPercentageChange = percentage(usdValue[0], usdValue[1]);

  const { holders: updatedHolders, hot_wallets } = await updateHolders({
    current: portfolios.current,
    prev: portfolios.previous,
  });

  const segmentResult = <SegmentResult>{
    id,
    count: address.current.length,

    min_price: minPrice,
    max_price: maxPrice,

    amount: amount[0],
    percentage_change: percentageChange,
    abs_percentage_change: Math.abs(percentageChange),

    usd_value: usdValue[0],
    usd_change: usdChange,
    usd_percentage_change: usdPercentageChange,
    abs_usd_percentage_change: Math.abs(usdPercentageChange),

    holders: updatedHolders,
    hot_wallets: hot_wallets,
  };

  return {
    segment_result: segmentResult,
    from_time: fromTime,
    to_time: toTime,
  };
};

const jobHandler = async ({ symbol, segment, crawl_ids }) => {
  try {
    const segmentResult = await processSegment({
      symbol,
      segment,
      crawl_ids,
    });

    if (!segmentResult) return;

    const { segment_result, from_time, to_time } = segmentResult;
    const output = <Output>{
      symbol: symbol,
      crawl_id: crawl_ids.current,
      from_time,
      to_time,
      ...segment_result,
    };

    await saveTopHoldersStatistics(output);
  } catch (e) {
    console.log('🚀 ~ file: topHolders.ts:187 ~ jobHandler ~ e', e);
  }
};

const getCrawlIds = async () => {
  const rawLogs = await cronLog.get();
  const ids = Array.from(new Set(rawLogs.map((l) => l.crawl_id)));
  const ranges = [];
  for (let i = 0; i < ids.length; i++) {
    ids[i + 1] &&
      ranges.push({
        current: ids[i],
        previous: ids[i + 1],
      });
  }
  return ranges.slice(0, 1);
};

/**
 * 1. Get symbol list
 * 2. Get segment & group
 * 3. Process data foreach segment/group
 */
const triggerCronJobs = async () => {
  const queueName = 'top-holders';
  const symbols = await getCoinList();
  const crawlIds = await getCrawlIds();

  const { addJobs } = await CronQueue({
    name: queueName,
    job_handler: async ({ data }) => {
      return await jobHandler(data);
    },
    drained_callback: async () => {
      console.log(
        '🚀 ~ file: index.ts:19 ~ drained_callback: ~ drained_callback',
      );
    },
    job_options: {
      // The total number of attempts to try the job until it completes
      attempts: 3,
      // Backoff setting for automatic retries if the job fails
      backoff: { type: 'fixed', delay: 10 * 1000 },
      removeOnComplete: {
        age: 60 * 60, // 1h
      },
      removeOnFail: true,
    },
  });

  const jobs = [];
  symbols.forEach((symbol) => {
    crawlIds.forEach((cid) => {
      SegmentOptions.forEach((segment) => {
        jobs.push({
          symbol,
          segment,
          crawl_ids: cid,

          // for jobid
          crawl_id: `${cid.current}:${symbol}`,
          offset: segment.offset,
          limit: segment.limit,
        });
      });
    });
  });

  await addJobs(jobs);

  return;
};

const scheduleCronJobs = () => {
  schedule.scheduleJob('*/30 * * * *', async function () {
    await triggerCronJobs();
  });
};

export default {
  triggerCronJobs,
  scheduleCronJobs,
};
