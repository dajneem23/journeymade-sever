import config from '@/config';
import { EPeriod, ITokenVolume } from '@/interfaces';
import { volumeCounterToken } from '@/loaders/worker';
import TokenService from '@/services/token';
import TransactionEventService from '@/services/transactionEvent';
import VolumeService from '@/services/volume';
import { flattenArray, getTimeFramesByPeriod, groupBy } from '@/utils';
import dayjs from '@/utils/dayjs';
import sequentially from '@/utils/sequentially';
import Container from 'typedi';
const CronJob = require('cron').CronJob;

require('events').EventEmitter.defaultMaxListeners = 100;

const period = EPeriod['5m'];

async function calculateVolume({ token, timeFrames, volumeLogs }) {
  const volumeService = Container.get(VolumeService);
  const txEventService = Container.get(TransactionEventService);
  const volumeWorker = Container.get(volumeCounterToken);

  const timeFrameFormData = timeFrames.filter((t) => {
    const timeFrame = volumeLogs.find(
      (v) =>
        v.token_address === token.address &&
        v.from_time === t[0] &&
        v.to_time === t[1],
    );
    return !timeFrame;
  });

  const txLogGroupedByTimeFrame = await Promise.all(
    timeFrameFormData.map(async (timeFrame) => {
      const value = await txEventService.getListByFilters({
        symbol: token.symbol,
        addresses: [token.address],
        min_usd_value: 0,
        time_frame: timeFrame,
        actions: ['swap'],
      });

      return await volumeWorker.getBuySellData(value, timeFrame);
    }),
  );

  const txLogs = flattenArray(txLogGroupedByTimeFrame);
  const volumeByTimeFrames = await volumeWorker.getChartData(
    timeFrameFormData,
    txLogs,
  );

  const updateData = volumeByTimeFrames.map((item) => {
    return <ITokenVolume>{
      token_address: token.address,
      from_time: item.time_frame.from,
      to_time: item.time_frame.to,
      period: period,

      chain_id: token.chainId,
      token_id: token.id,
      token_symbol: token.symbol,

      count: item.count,
      amount: item.amount,
      usd_value: item.usd_value,
      price: item.price,
      tags: item.tags,
      change_percentage: item.change_percentage,

      buy: item.buy,
      sell: item.sell,
    };
  });

  await volumeService.bulkSave(updateData);

  return updateData.length;
}

export default async function handle() {
  const job = new CronJob(config.cron.VOLUME, function () {
    process();
  });
  job.start();

  async function process() {
    console.log('🚀 ~ config.cron.VOLUME:', config.cron.VOLUME);

    const now = dayjs();
    const timeFrames = getTimeFramesByPeriod({
      period,
      limit: 48,
      to_time: now.add(-30, 'minute').unix(), // get logs of > 30 mins ago
    });

    const tokenService = Container.get(TokenService);
    const volumeService = Container.get(VolumeService);

    const { items: tokens } = await tokenService.getEnabledTokenList();
    let count = 0;

    console.time('getListByFilters');
    const filter = {
      addresses: tokens.map((token) => token.address),
      from_time: Math.min(...timeFrames.map((t) => t[0])),
      to_time: Math.max(...timeFrames.map((t) => t[1])),
    };
    console.log(
      '🚀 ~ file: volumeCron.ts:44 ~ filter:',
      filter.from_time,
      filter.to_time,
    );
    const volumeLogs = await volumeService.getListByFilters(filter, {
      select: {
        token_address: 1,
        from_time: 1,
        to_time: 1,
      },
    });
    console.timeEnd('getListByFilters');

    console.time('calculateVolume');
    const groupedTokens = Object.values(groupBy(tokens, 'id'));
    await sequentially(
      groupedTokens,
      async (group) => {
        await Promise.all(
          group.map(async (token) => {
            const updateCount = await calculateVolume({
              token,
              timeFrames,
              volumeLogs,
            });

            count += updateCount;
          }),
        );
      },
      2,
    );
    console.timeEnd('calculateVolume');

    console.log('done:', count);
  }
}
