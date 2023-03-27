import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import dayjs from '@/utils/dayjs';
import { Logger } from 'winston';
import { IPrice } from '../../interfaces/IPrice';
import PriceService from '../../services/price';
import { EPeriod } from '@/interfaces';
import { getTimestampsByPeriod } from '@/utils';

@Service()
export default class PriceController {
  constructor() {
  }

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { symbol } = req.params;

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

      const service = Container.get(PriceService);
      const data = await Promise.all(
        timestamps.map(async (timestamp) => {
          const value = await service.getAVGPrice({ symbol, from_time: timestamp[0], to_time: timestamp[1] });
          const { price, high, low } = (value && value[0]) || {};
        
          return {
            from_time: timestamp[0],
            to_time: timestamp[1],
            from_time_str: dayjs.unix(timestamp[0]).format('YYYY-MM-DD HH:mm:ss'),
            to_time_str: dayjs.unix(timestamp[1]).format('YYYY-MM-DD HH:mm:ss'),
            price: +price,
            high: +high,
            low: +low
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
          timestamp: +price.timestamp,
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
