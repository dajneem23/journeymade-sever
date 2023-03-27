import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { IToken, ITokenVolume } from '@/interfaces';
import TransactionEventService from '@/services/transactionEvent';
import { getTimestampsByPeriod } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import { Logger } from 'winston';
import TokenService from '../../services/token';
import { EPeriod } from '../../interfaces/EPeriod';
import { sumArrayByField } from '../../utils/sumArrayByField';

@Service()
export default class TokenController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { symbols, page = 1, limit = 50 } = req.query;
    try {
      const serviceInstance = Container.get(TokenService);
      const { itemCount, items } = await serviceInstance.getTokenList({
        symbols: symbols ? (symbols as string).split(',') : [],
        offset: +req['skip'] || 0,
        limit: 1000,
      });

      const pageCount = Math.ceil(itemCount / 1000);
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

  public async getVolume(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { name } = req.params;
    const { period = EPeriod['1h'], page = 1, limit = 10 } = req.query;
    const offset = +req['skip'] || 0;

    try {
      const service = Container.get(TransactionEventService);
      const timestamps = getTimestampsByPeriod({
        period: period as EPeriod,
        offset: +offset,
        limit: +limit,
      });

      const items = await Promise.all(
        timestamps.map(async (timestamp) => {
          const item = await service.getVolume({
            symbol: name,
            timestamp
          })

          return <ITokenVolume>{
            from_time: timestamp[0],
            to_time: timestamp[1],
            sell: {
              count: sumArrayByField(item, 'sell_count'),
              volume: sumArrayByField(item, 'sell_volume'),
            },
            buy: {
              count: sumArrayByField(item, 'buy_count'),
              volume: sumArrayByField(item, 'buy_volume'),
            },
            chains: item.map((c) => {
              return {
                id: c._id,
                sell: {
                  count: c.sell_count,
                  volume: c.sell_volume,
                },
                buy: {
                  count: c.buy_count,
                  volume: c.buy_volume,
                },
              };
            })
          }
        })
      )

      const success = new SuccessResponse(res, {
        data: items
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async add(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling add endpoint with body: %o', req.body);

    const { tokens } = req.body;

    try {
      const insertData = tokens.map(
        (token) =>
          <IToken>{
            ...token,
          },
      );

      const serviceInstance = Container.get(TokenService);
      await serviceInstance.insert(insertData);

      const success = new SuccessResponse(res, {
        data: {},
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling delete endpoint with body: %o', req.body);

    const { symbol } = req.body;
    try {
      const serviceInstance = Container.get(TokenService);
      const deleted = await serviceInstance.delete(symbol);
      if (!deleted) throw new AppError(400, 'fail', 'Token not found');

      new SuccessResponse(res, {
        data: {},
      }).send();
    } catch (err) {
      next(err);
    }
  }
}
