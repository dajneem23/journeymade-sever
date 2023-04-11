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
import { getTimeFramesByPeriod } from '@/utils';
import { TimeFramesLimit } from '@/constants';

@Service()
export default class PriceController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { tokenId } = req.params;

    try {
      const now = dayjs();
      const {
        to_time = now.unix(),
        period,
        page = 1,
        limit = TimeFramesLimit,
      } = req.query;

      const timestamps = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: +limit,
        to_time: +to_time,
      });
      
      const service = Container.get(PriceService);
      // console.log("🚀 ~ file: price.ts:66 ~ PriceController ~ timestamps.map ~ timestamps:", timestamps.length)
      const data = await Promise.all(
        timestamps.map(async (timestamp, index) => {
          const value = await service.getAVGPrice({
            token_id: tokenId,
            from_time: timestamp[0],
            to_time: timestamp[1],
          });
          const { price, high, low } = (value && value[0]) || {};

          return {
            from_time: timestamp[0],
            to_time: timestamp[1],
            from_time_str: dayjs
              .unix(timestamp[0])
              .format('YYYY-MM-DD HH:mm:ss'),
            to_time_str: dayjs.unix(timestamp[1]).format('YYYY-MM-DD HH:mm:ss'),
            price: +price,
            high: +high,
            low: +low,
            time_index: index
          };
        }),
      );
      console.log("🚀 ~ file: price.ts:65 ~ PriceController ~ getList ~ data:", data)

      const values = data.map((item) => [item.price, item.high, item.low]).flat();
      const min = Math.min(...values);
      const max = Math.max(...values);
      console.log("🚀 ~ file: price.ts:70 ~ PriceController ~ getList ~ max:", min, max)

      const success = new SuccessResponse(res, {
        data: {
          min: min - (max - min) * 0.25,
          max: max + (max - min) * 0.25,
          items: data,
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
