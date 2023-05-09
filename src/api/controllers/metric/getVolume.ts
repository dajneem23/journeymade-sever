import { TimeFramesLimit } from '@/constants';
import { SuccessResponse } from '@/core';
import { EPeriod } from '@/interfaces';
import { CustomRequestType } from '@/loaders/express';
import { volumeCounterToken } from '@/loaders/worker';
import TransactionEventService from '@/services/transactionEvent';
import VolumeService from '@/services/volume';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from 'dayjs';
import { NextFunction, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getVolume(
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
  const offset = +req['skip'] || 0;

  console.time('getVolume');

  try {
    const volumeService = Container.get(VolumeService);
    const handler = to_time === now.unix() ? volumeService.getLatestVolume : volumeService.getHistoricalVolume;
    const data = await handler({
      token_id: token.id,
      period: period as string,
      limit: +limit,
      to_time: +to_time,
    })

    // console.time('getTxLogs');
    // const txLogGroupedByTimeFrame = await Promise.all(
    //   timeFrames.map(async (timeFrame) => {
    //     // console.time(`${JSON.stringify(timeFrame)} getTxLogs`);
    //     const value = await txEventService.getListByFilters({
    //       symbol: token.symbol,
    //       addresses: token.chains?.map((token) => token.address) || [],
    //       min_usd_value: 0,
    //       time_frame: timeFrame,
    //       actions: ['swap'],
    //     });
    //     // console.timeEnd(`${JSON.stringify(timeFrame)} getTxLogs`);

    //     return await volumeWorker.getBuySellData(value, timeFrame);
    //   }),
    // );
    // console.timeEnd('getTxLogs');
    // const txLogs = txLogGroupedByTimeFrame.flat();

    // console.time('getVolumeFrames');
    // const volumeFrames = await volumeWorker.getVolumeFrames(
    //   txLogGroupedByTimeFrame,
    // );
    // console.timeEnd('getVolumeFrames');

    // console.time('getChartData');
    // const chartData = await volumeWorker.getChartData(timeFrames, txLogs);
    // console.timeEnd('getChartData');

    console.timeEnd('getVolume');
    const success = new SuccessResponse(res, {
      data
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
