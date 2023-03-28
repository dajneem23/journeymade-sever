import { ErrorResponse, SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transaction';
import TransactionEventService from '@/services/transactionEvent';
import { Logger } from 'winston';
import { EPeriod, ITransaction } from '../../interfaces';
import { getTimestampsByPeriod } from '@/utils';
import dayjs from '@/utils/dayjs';
import TokenService from '@/services/token';
import { spawn, Thread, Worker } from "threads"
import { Counter } from '@/workers/behavior-stats';

@Service()
export default class BehaviorController {
  constructor() {}

  public async getByTokenId(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { tokenId } = req.params;
    const tokenService = Container.get(TokenService);
    const tokens = await tokenService.getByID(tokenId);
    if (!tokens || tokens.length === 0) {
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 'error',
      });
      error.send();
      return;
    }

    try {
      const now = dayjs();
      const { 
        from_time = now.add(-7, 'day').unix(), 
        to_time = now.unix(), 
        period,
        page = 1,
        limit = 10,
      } = req.query;
      const offset = +req['skip'] || 0;

      const timestamps = getTimestampsByPeriod({
        period: period as EPeriod, 
        limit: +limit,
        offset: +offset,
        from_time: +from_time,
        to_time: +to_time,
      });  

      const txEventService = Container.get(TransactionEventService);
      const worker = await spawn<Counter>(new Worker("../../workers/behavior-stats"));

      const data = await Promise.all(
        timestamps.map(async (timestamp) => {
          const value = await txEventService.getListByFilters({ 
            addresses: tokens.map((token) => token.address),
            min_usd_value: 1000,
            timestamp
          });

          const updated = await worker.getStats(value);
        
          return {
            from_time: timestamp[0],
            to_time: timestamp[1],
            from_time_str: dayjs.unix(timestamp[0]).format('YYYY-MM-DD HH:mm:ss'),
            to_time_str: dayjs.unix(timestamp[1]).format('YYYY-MM-DD HH:mm:ss'),
            activity: updated
          }
        })
      )

      const success = new SuccessResponse(res, {
        data,
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }
}
