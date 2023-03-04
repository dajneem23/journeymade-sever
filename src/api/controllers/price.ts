import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import dayjs from '@/utils/dayjs';
import { Logger } from 'winston';
import { IPrice } from '../../interfaces/IPrice';
import PriceService from '../../services/price';

@Service()
export default class PriceController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { symbol } = req.params;

    try {
      const now = dayjs();
      const { 
        from_time = now.add(-7, 'day').unix(), 
        to_time = now.unix(),  
        page = 1,
        limit = 100,
      } =
        req.body;

      const serviceInstance = Container.get(PriceService);
      const { itemCount, items } = await serviceInstance.getPriceList({
        symbol,
        from_time,
        to_time,
        offset: +req['skip'] || 0,
        limit: +limit,
      });

      const pageCount = Math.ceil(itemCount / +limit);
      const success = new SuccessResponse(res, {
        data: {
          items,
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

  public async add(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling add endpoint with body: %o', req.body);

    const { prices } = req.body;
    if (!prices) throw new AppError(400, 'fail', 'accounts is required');

    try {
      const insertData = prices.map((price) => {
        return <IPrice>{
          symbol: price.symbol,
          price: +price.price,
          time_at: +price.time_at,
          volume: price.volume && +price.volume,
        };
      });

      const serviceInstance = Container.get(PriceService);
      await serviceInstance.insert(insertData);

      const success = new SuccessResponse(res, {
        data: {},
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }
}
