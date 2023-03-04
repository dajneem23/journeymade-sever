import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { IAccount } from '@/interfaces';
import { convertStringToArray } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import AccountService from '@/services/account';
import { Logger } from 'winston';

@Service()
export default class AccountController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling add endpoint with query: %o', req.query);
    const { page = 1, limit = 100, addresses, tags, tokens } = req.query;

    try {
      const addressesList = addresses && (addresses as string).split(',');
      const tagList = tags && (tags as string).split(',');
      const tokenList = tokens && (tokens as string).split(',');

      const accountServiceInstance = Container.get(AccountService);
      const { itemCount, items } = await accountServiceInstance.getAccountList({
        addresses: addressesList,
        tags: tagList,
        tokens: tokenList,
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

    const { accounts } = req.body;
    if (!accounts) throw new AppError(400, 'fail', 'accounts is required');

    try {
      const insertData = accounts.map((account) => {
        const tokens = account.tokens
          ? convertStringToArray(account.tokens).join(',')
          : '';
        const tags = account.tags
          ? convertStringToArray(account.tags).join(',')
          : '';
        const chains = account.chains
          ? convertStringToArray(account.chains).join(',')
          : '';

        return <IAccount>{
          address: account.address,
          tokens,
          tags,
          chains,
        };
      });

      const accountServiceInstance = Container.get(AccountService);
      await accountServiceInstance.insert(insertData);

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

    const { address } = req.body;
    try {
      const accountServiceInstance = Container.get(AccountService);
      const deleted = await accountServiceInstance.delete(address);
      if (!deleted) {
        throw new AppError(400, 'fail', 'address not found');
      }

      new SuccessResponse(res, {
        data: {},
      }).send();
    } catch (err) {
      next(err);
    }
  }
}
