import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TagService from '@/services/tag';
import { Logger } from 'winston';
import { ITag } from '../../interfaces/ITag';

@Service()
export default class TagController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { ids, page = 1, limit = 100 } = req.query;

    try {
      const serviceInstance = Container.get(TagService);
      const { itemCount, items } = await serviceInstance.getTagList({
        ids: ids && (ids as string).split(','),
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

    const { tags } = req.body;
    if (!tags) throw new AppError(400, 'fail', 'accounts is required');

    try {
      const insertData = tags.map((tag) => {
        return <ITag>{
          id: tag.id,
          name: tag.name,
          description: tag.description,
          source: tag.source,
          volume: tag.volume && +tag.volume,
        };
      });

      const serviceInstance = Container.get(TagService);
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
      const serviceInstance = Container.get(TagService);
      const deleted = await serviceInstance.delete(id);
      if (!deleted) throw new AppError(400, 'fail', 'Tag not found');

      new SuccessResponse(res, {
        data: {},
      }).send();
    } catch (err) {
      next(err);
    }
  }
}
