import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transaction';
import TransactionEventService from '@/services/transactionEvent';
import { Logger } from 'winston';
import { EPeriod, ITransaction } from '../../interfaces';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from '@/utils/dayjs';

@Service()
export default class TransactionController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const {
      token_id,
      token_symbol,
      addresses,
      from_time,
      to_time,
      page,
      limit,
    } = req.query;

    try {
      const serviceInstance = Container.get(TransactionService);
      const { itemCount, items } = await serviceInstance.getList({
        token_id: token_id && String(token_id),
        token_symbol: token_symbol && String(token_symbol),
        addresses: addresses && (addresses as string).split(','),
        from_time: from_time && +from_time,
        to_time: to_time && +to_time,
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

  public async getEventStats(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const {
      limit = 12,
    } = req.query;
    const offset = +req['skip'] || 0;

    try {
      const timestamps = getTimeFramesByPeriod({
        period: EPeriod['1h'],
        limit: +limit,
        // offset,
      });

      const service = Container.get(TransactionEventService);

      const stats = await Promise.all(
        timestamps.map(async (timestamp) => {
          const value = await service.groupByTokenSymbol({ timestamp });

          const countValidTokenPrice = value.reduce((sum, value) => {
            return sum + (+value.has_price_count > 0 ? value.count : 0);
          }, 0);
  
          const hasPriceCount = value.reduce((sum, value) => {
            return sum + +value.has_price_count;
          }, 0);
          const sumUsdValue = value.reduce((sum, value) => {
            return sum + +value.usd_value;
          }, 0);
  
          const noTokenPriceTokens = value.filter((value) => {
            return +value.count > 0 && +value.has_price_count === 0;
          });

          return {
            timestamps: [timestamp[0], timestamp[1]],
            times: [
              dayjs(timestamp[0] * 1000).format(),
              dayjs(timestamp[1] * 1000).format(),
            ],
            count: countValidTokenPrice,
            has_price_count: hasPriceCount,
            sum_usd_value: sumUsdValue,
  
            no_token_price_count: noTokenPriceTokens.reduce((sum, value) => {
              return sum + value.count;
            }, 0),
            no_token_price_tokens: noTokenPriceTokens.map((value) => value._id),
  
            by_token: value,
          };
        })
      )

      const success = new SuccessResponse(res, {
        data: stats,
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async add(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling add endpoint with body: %o', req.body);

    const { transactions } = req.body;
    if (!transactions) throw new AppError(400, 'fail', 'accounts is required');

    try {
      const insertData = transactions.map((transaction) => {
        return <ITransaction>{
          ...transaction,
        };
      });

      const serviceInstance = Container.get(TransactionService);
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

    const { id } = req.body;
    try {
      const serviceInstance = Container.get(TransactionService);
      const deleted = await serviceInstance.delete(id);
      if (!deleted) throw new AppError(400, 'fail', 'id not found');

      new SuccessResponse(res, {
        data: {},
      }).send();
    } catch (err) {
      next(err);
    }
  }

  public async getEventBlocks(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    try {
      const serviceInstance = Container.get(TransactionEventService);
      const latest = await serviceInstance.getLatestBlockNumber();
      const min = await serviceInstance.getMinBlockNumber();

      const success = new SuccessResponse(res, {
        data: {
          latest,
          min,
        },
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async getLogsByTxHash(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { hash } = req.params;
    if (!hash) throw new AppError(400, 'fail', 'tx_hash is required');

    try {
      const serviceInstance = Container.get(TransactionEventService);
      const logs = await serviceInstance.getByTxHash({ tx_hash: String(hash) })

      const success = new SuccessResponse(res, {
        data: logs,
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }
}
