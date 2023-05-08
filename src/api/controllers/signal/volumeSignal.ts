import { TimeFramesLimit } from '@/constants';
import { SuccessResponse } from '@/core';
import { EPeriod, ITokenSignalResponse } from '@/interfaces';
import { CustomRequestType } from '@/loaders/express';
import { signalCounterToken, volumeCounterToken } from '@/loaders/worker';
import TransactionEventService from '@/services/transactionEvent';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from 'dayjs';
import { NextFunction, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

const PREV_TIME_FRAMES_COUNT_OPTIONS = {
  [EPeriod['1h']]: 24,
  [EPeriod['4h']]: 42,
  [EPeriod['1d']]: 30,
  [EPeriod['7d']]: 12,
}

export async function volumeSignal(
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with query: %o', req.query);

  const token = req.metadata.token;

  const now = dayjs();
  const {
    to_time = now.unix(),
    period = EPeriod['1h'],
    page = 1,
    limit = TimeFramesLimit,
  } = req.query;
  const prevTimeFrameCount = PREV_TIME_FRAMES_COUNT_OPTIONS[period as string] || PREV_TIME_FRAMES_COUNT_OPTIONS['1h'];

  try {
    const mainTimeFrames = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: +limit,
      to_time: +to_time,
    });

    const firstTimeFrame = mainTimeFrames[0];
    const prevTimeFrames = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: prevTimeFrameCount + 1,
      to_time: firstTimeFrame[0],
    }).slice(0, prevTimeFrameCount);

    const timeFrames = [...prevTimeFrames, ...mainTimeFrames];

    const txEventService = Container.get(TransactionEventService);
    const volumeWorker = Container.get(volumeCounterToken);
    const signalWorker = Container.get(signalCounterToken);

    const { symbol, chains } = token;
    const tokenAddressList = chains?.map((chain) => chain.address) || [];

    const txLogs = (
      await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const txLogsInTimeFrame = await txEventService.getListByFilters({
            symbol,
            addresses: tokenAddressList,
            min_usd_value: 10,
            time_frame: timeFrame,
            actions: ['swap'],
          });
          return await volumeWorker.getBuySellData(
            txLogsInTimeFrame,
            timeFrame,
          );
        }),
      )
    ).flat();

    const dataByTimeFrame = await volumeWorker.getChartData(timeFrames, txLogs);

    const { EMAValues } = await signalWorker.getRawSignals(
      dataByTimeFrame,
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
                  // ...signal,
                  ...(await signalWorker.getLeader(txLogs, signal)),
                };
              }),
            ),
          };
        }),
      )
    ).flat();

    // TODO:
    const success = new SuccessResponse(res, {
      data: {
        time_frames: mainTimeFrames.map((tf) => tf[0]),
        chart_data: signals,
      },
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
