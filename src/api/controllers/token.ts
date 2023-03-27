import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { IToken, ITokenVolume } from '@/interfaces';
import TransactionEventService from '@/services/transactionEvent';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import { Logger } from 'winston';
import TokenService from '../../services/token';

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
    const { period = '1h', page = 1, limit = 10 } = req.query;

    try {
      const serviceInstance = Container.get(TransactionEventService);
      const { itemCount, items } = await serviceInstance.getVolume({
        symbol: name,
        addresses: [],
        period,
        offset: +req['skip'] || 0,
        limit: +limit,
      });

      const updated: ITokenVolume[] = items.map((item) => {
        return {
          from_time: item.from_time,
          to_time: item.to_time,
          chains: item.value.map((c) => {
            return {
              id: c._id,
              sell: {
                count: c.sell_count,
                volume: c.sell_volume,
              },
              buy: {
                count: c.buy_count,
                volume: c.buy_volume,
              }
            };
          })
        }
      });

      const pageCount = Math.ceil(itemCount / +limit);
      const success = new SuccessResponse(res, {
        data: {
          items: updated,
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
