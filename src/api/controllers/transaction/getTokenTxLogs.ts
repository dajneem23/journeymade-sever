import { SuccessResponse } from '@/core';
import { EPeriod } from '@/interfaces';
import { CustomRequestType } from '@/loaders/express';
import { volumeCounterToken } from '@/loaders/worker';
import TransactionEventService from '@/services/transactionEvent';
import { getTimeFramesByPeriod, sortArray } from '@/utils';
import dayjs from '@/utils/dayjs';
import { NextFunction, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getTokenTxLogs(req: CustomRequestType, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with params: %o', req.params);

  const { token } = req.metadata;

  try {
    const now = dayjs();
    const {
      to_time = now.unix(),
    } = req.query;

    const timeFrames = getTimeFramesByPeriod({
      period: EPeriod['1h'],
      limit: 12,
      to_time: +to_time,
    });

    const txEventService = Container.get(TransactionEventService);
    const volumeWorker = Container.get(volumeCounterToken);

    const txLogs = (await Promise.all(
      timeFrames.map(async (timeFrame) => {
        const value = await txEventService.getListByFilters({
          symbol: token.symbol,
          addresses: token.chains?.map((chain) => chain.address) || [],
          min_usd_value: 1,
          time_frame: timeFrame,
          actions: ['swap', 'add', 'remove'],
        });

        return await volumeWorker.getBuySellData(value, timeFrame);
      })
    )).flat();

    const success = new SuccessResponse(res, {
      data: {
        tx_logs: sortArray(txLogs, 'time', 'desc'),
      },
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
