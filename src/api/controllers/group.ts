import { Container, Service } from 'typedi';
import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { IAccount } from '@/interfaces';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { convertStringToArray } from '@/utils';

import GroupService from '@/services/group';
import { Logger } from 'winston';
import { IGroup } from '../../interfaces/IGroup';

@Service()
export default class GroupController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);
    
    const { page = 1, limit = 100, ids, tags, tokens } = req.query;
    try {
      const idList = ids && (ids as string).split(',');
      const tagList = tags && (tags as string).split(',');
      const tokenList = tokens && (tokens as string).split(',');

      const serviceInstance = Container.get(GroupService);
      const { itemCount, items } = await serviceInstance.getList({
        ids: idList,
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

    const { groups } = req.body;
    if (!groups) throw new AppError(400, 'fail', 'accounts is required');

    try {
      const insertData = groups.map((group) => {
        const tags = group.tags
          ? convertStringToArray(group.tags).join(',')
          : '';

        return <IGroup>{
          ...group,
          tags: tags,
        };
      });

      const serviceInstance = Container.get(GroupService);
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
      const serviceInstance = Container.get(GroupService);
      const deleted = await serviceInstance.delete(id);
      if (!deleted) {
        throw new AppError(400, 'fail', 'Group not found');
      }

      new SuccessResponse(res, {
        data: {},
      }).send();
    } catch (err) {
      next(err);
    }
  }
}
