import { SuccessResponse } from '@/core';
import { EPeriod } from '@/interfaces';
import { CustomRequestType } from '@/loaders/express';
import { volumeCounterToken } from '@/loaders/worker';
import TransactionEventService from '@/services/transactionEvent';
import { flattenArray, getTimeFramesByPeriod, sortArray } from '@/utils';
import dayjs from '@/utils/dayjs';
import { NextFunction, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getTokenTxLogs(
  req: CustomRequestType,
  res: Response,
  next: NextFunction,
) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with params: %o', req.params);

  const { token } = req.metadata;
  const { from_usd_value: fromUsdValue, action, limit = 100 } = req.query;
  const offset = +req['skip'] || 0;

  try {
    const now = dayjs();
    const { to_time = now.unix() } = req.query;

    const timeFrames = getTimeFramesByPeriod({
      period: EPeriod['30d'],
      limit: 1,
      to_time: +to_time,
    });

    const txEventService = Container.get(TransactionEventService);
    const volumeWorker = Container.get(volumeCounterToken);

    const actions = [];
    switch (action) {
      case 'buy':
        actions.push('swap');
        break;
      case 'sell':
        actions.push('swap');
        break;
      case 'add':
        actions.push('add');
        break;
      case 'remove':
        actions.push('remove');
        break;
      case 'transfer':
        actions.push('transfer');
        break;
      default:
        actions.push('swap', 'add', 'remove');
        break;
    }

    const txLogs = await Promise.all(
      timeFrames.map(async (timeFrame) => {
        const value = await txEventService.getListByFilters({
          // symbol: token.symbol,
          addresses: token.chains?.map((chain) => chain.address) || [],
          min_usd_value: +fromUsdValue || 1,
          time_frame: timeFrame,
          actions,
          limit: +limit,
          offset,
        });

        if (action === 'transfer') return value;

        if (action === 'buy' || action === 'sell') {
          return (await volumeWorker.getBuySellData(value, timeFrame)).filter(
            (log) => log.action === action,
          );
        }

        return await volumeWorker.getBuySellData(value, timeFrame);
      }),
    );

    const success = new SuccessResponse(res, {
      data: {
        tx_logs: sortArray(flattenArray(txLogs), 'time', 'desc'),
      },
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
