import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transaction';
import { Logger } from 'winston';
import { ITransaction } from '../../interfaces';

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
}
