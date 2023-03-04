import { Container, Service } from 'typedi';
import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { IAccount } from '@/interfaces';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { convertStringToArray } from '@/utils';

import GroupService from '@/services/group';
import { Logger } from 'winston';
import { IGroupFootprint } from '../../interfaces/IGroupFootprint';
import GroupFootprintService from '../../services/groupFootprint';

@Service()
export default class GroupFootprintController {
  constructor() {}

  public async getList(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { token, from_time, to_time } = req.query;
    try {
      const serviceInstance = Container.get(GroupFootprintService);
      const { items } = await serviceInstance.getList({
        token: token as string,
        from_time: +from_time,
        to_time: +to_time,
        amount: 0,
      });

      const success = new SuccessResponse(res, {
        data: {
          items,
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

    const { footprints } = req.body;
    if (!footprints) throw new AppError(400, 'fail', 'footprints is required');

    try {
      const insertData = footprints.map((footprint) => {
        return <IGroupFootprint>{
          ...footprint,
        };
      });

      const serviceInstance = Container.get(GroupFootprintService);
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
