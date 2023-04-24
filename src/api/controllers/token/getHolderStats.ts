import { TimeFramesLimit } from '@/constants';
import { ErrorResponse, SuccessResponse } from '@/core';
import { EPeriod } from '@/interfaces';
import DebankTopHoldersService from '@/services/debankTopHolders';
import TokenService from '@/services/token';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';

export async function getHolderStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with query: %o', req.query);

  const { id } = req.params;
  const now = dayjs();
  const {
    to_time = now.unix(),
    period = EPeriod['1h'],
    page = 1,
    limit = TimeFramesLimit,
  } = req.query;
  const offset = +req['skip'] || 0;

  const tokenService = Container.get(TokenService);
  const token = await tokenService.getByID(id);
  if (!token) {
    const error = new ErrorResponse(res, {
      message: 'Token not found',
      code: 404,
      data: {},
      status: 404,
    });
    error.send();
    return;
  }

  try {
    const service = Container.get(DebankTopHoldersService);
    const timestamps = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: +limit,
      to_time: +to_time,
    });
    const { ids } = token;
    console.log(
      '🚀 ~ file: token.ts:217 ~ TokenController ~ getHolderStats ~ ids',
      ids,
    );
    // // TODO:
    const stats = ids?.debank_id && (await service.getStatsById(ids.debank_id));

    const success = new SuccessResponse(res, {
      data: stats?.stats,
    });

    success.send();
  } catch (err) {
    next(err);
  }
}
