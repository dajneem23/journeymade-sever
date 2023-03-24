import { SuccessResponse } from '@/core';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transactionEvent';
import { Logger } from 'winston';
import dayjs from '@/utils/dayjs';

@Service()
export default class SignalController {
  constructor() {}

  public async getLast24hHighUsdValueTxEvent(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { min_usd_value, event_type, account_type, symbol, page = 1, limit = 100 } = req.query;

    try {
      const serviceInstance = Container.get(TransactionService);
      const { itemCount, items } = await serviceInstance.getLast24hHighUsdValueTxEvent({
        min_usd_value: +min_usd_value,
        event_type,
        account_type,
        symbol,
        offset: +req['skip'] || 0,
        limit: +limit,
      });

      const updatedItems = items.map((item) => {
        return {
          ...item,
          block_time: dayjs.unix(item.timestamp).format('YYYY-MM-DD HH:mm:ss')
        };
      })

      const pageCount = Math.ceil(itemCount / +limit);
      const success = new SuccessResponse(res, {
        data: {
          items: updatedItems,
          has_more: paginate.hasNextPages(req)(pageCount),
          page: +page,
          total: itemCount,
        },
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }
}
