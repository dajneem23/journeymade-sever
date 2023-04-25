import config from '@/config';
import { TimeFramesLimit } from '@/constants';
import { EPeriod, ITokenSignalResponse, ITokenVolume } from '@/interfaces';
import { signalCounterToken, volumeCounterToken } from '@/loaders/worker';
import TokenService from '@/services/token';
import TransactionEventService from '@/services/transactionEvent';
import VolumeService from '@/services/volume';
import { flattenArray, getTimeFramesByPeriod, groupBy } from '@/utils';
import dayjs from '@/utils/dayjs';
import sequentially from '@/utils/sequentially';
import Container from 'typedi';
const CronJob = require('cron').CronJob;

require('events').EventEmitter.defaultMaxListeners = 200;

async function calculateVolume({ token, timeFrames, volumeLogs, period }) {
  const volumeService = Container.get(VolumeService);
  const txEventService = Container.get(TransactionEventService);
  const volumeWorker = Container.get(volumeCounterToken);
  const now = dayjs();

  const timeFrameFormData = timeFrames.filter((t) => {
    const timeFrame = volumeLogs.find(
      (v) =>
        v.token_address === token.address &&
        v.from_time === t[0] &&
        v.to_time === t[1] &&
        t[1] <= now.add(-30, 'minute').unix(),
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
      period,

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

  console.log(`calculateVolume:${token.address}-${token.id}: ${updateData.length}`);

  return updateData.length;
}

async function calculateVolumeCron() {
  const period = EPeriod['5m'];
  const job = new CronJob(config.cron.VOLUME, function () {
    process();
  });
  job.start();

  async function process() {
    console.log('🚀 ~ config.cron.VOLUME:', config.cron.VOLUME);

    const now = dayjs();
    const timeFrames = getTimeFramesByPeriod({
      period,
      limit: 200,
      to_time: now.unix(), // get logs of > 30 mins ago
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
              period,
            });
            count += updateCount;
          }),
        );
      },
      2,
    );

    console.log('done:', count);
  }
}

const PREV_TIME_FRAMES_COUNT_OPTIONS = {
  [EPeriod['1h']]: 24,
  [EPeriod['4h']]: 42,
  [EPeriod['1d']]: 30,
  [EPeriod['7d']]: 12,
};

async function getSignals() {
  const now = dayjs();
  const period = EPeriod['5m'];

  // const timeFrames = getTimeFramesByPeriod({
  //   period,
  //   limit: 48,
  //   to_time: now.unix(),
  // });

  const mainTimeFrames = getTimeFramesByPeriod({
    period: period as EPeriod,
    limit: TimeFramesLimit,
    to_time: +now.unix(),
  });

  const prevTimeFrameCount = PREV_TIME_FRAMES_COUNT_OPTIONS[period as string];
  const firstTimeFrame = mainTimeFrames[0];
  const prevTimeFrames = getTimeFramesByPeriod({
    period: period as EPeriod,
    limit: prevTimeFrameCount + 1,
    to_time: firstTimeFrame[0],
  }).slice(0, prevTimeFrameCount);

  const timeFrames = [...prevTimeFrames, ...mainTimeFrames];

  const tokenService = Container.get(TokenService);
  const volumeService = Container.get(VolumeService);
  const volumeWorker = Container.get(volumeCounterToken);
  const signalWorker = Container.get(signalCounterToken);
  const { items: tokens } = await tokenService.getEnabledTokenList();

  const signals = await process('matic-network');
  console.log('🚀 ~ file: volumeCron.ts:189 ~ getSignals ~ signals:', signals);

  async function process(token_id) {
    const filter = {
      token_id,
      from_time: Math.min(...timeFrames.map((t) => t[0])),
      to_time: Math.max(...timeFrames.map((t) => t[1])),
    };
    console.log('🚀 ~ file: volumeCron.ts:192 ~ process ~ filter:', filter);

    const volumeOfAddress = await volumeService.getListByTokenId(filter, {
      select: {
        token_address: 1,
        from_time: 1,
        to_time: 1,
      },
    });

    // const volumeOfToken = Object.values(groupBy(volumeOfAddress, 'token_id')).;

    const { EMAValues } = await signalWorker.getRawSignals(
      volumeOfAddress,
      prevTimeFrameCount,
    );

    const rawSignals = mainTimeFrames
      .map((timeFrame, index) => {
        return {
          timeFrame,
          time_index: index,
          signals: EMAValues.filter(
            (signal) =>
              signal.time_frame.from === timeFrame[0] &&
              signal.time_frame.to === timeFrame[1],
          ),
        };
      })
      .filter((item) => item.signals.length > 0);

    const signals = (
      await Promise.all(
        rawSignals.map(async ({ timeFrame, time_index, signals }) => {
          return <ITokenSignalResponse>{
            title: `Alert: ${signals
              .map((signal) => signal.action)
              .join(', ')}`,
            type: signals.length > 1 ? 'multiple' : signals[0].action,
            description: '....',
            time_frame: {
              from: timeFrame[0],
              to: timeFrame[1],
            },
            time_index: time_index,
            signals: await Promise.all(
              signals.map(async (signal) => {
                return {
                  volume: {
                    total: signal.parent.usd_value,
                    total_change_percentage: signal.parent.change_percentage,
                    buy: signal.parent.buy.usd_value,
                    buy_change_percentage: signal.parent.buy.change_percentage,
                    sell: signal.parent.sell.usd_value,
                    sell_change_percentage:
                      signal.parent.sell.change_percentage,
                  },
                };
              }),
            ),
          };
        }),
      )
    ).flat();

    return signals;
  }
}

export default async function handle() {
  calculateVolumeCron();

  // getSignals();
}
