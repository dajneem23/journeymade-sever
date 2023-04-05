import { ErrorResponse, SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transaction';
import TransactionEventService from '@/services/transactionEvent';
import DebankTopHoldersService from '@/services/debankTopHolders'
import { Logger } from 'winston';
import { EPeriod, ITransaction } from '../../interfaces';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from '@/utils/dayjs';
import TokenService from '@/services/token';
import { spawn, Thread, Worker } from "threads"
import { Counter } from '@/workers/behavior-stats';
import { Counter as ATSCounter } from '@/workers/activity-trend-score';
import { TimeFramesLimit } from '@/constants';

@Service()
export default class BehaviorController {
  constructor() {}

  public async getByTokenId(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { tokenId } = req.params;
    const tokenService = Container.get(TokenService);
    const tokens = await tokenService.getByID(tokenId);
    if (!tokens || tokens.length === 0) {
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 'error',
      });
      error.send();
      return;
    }

    try {
      const now = dayjs();
      const { 
        to_time = now.unix(), 
        period,
        limit = TimeFramesLimit,
      } = req.query;

      const timeFrames = getTimeFramesByPeriod({
        period: period as EPeriod, 
        limit: +limit,
        to_time: +to_time,
      });  

      const txEventService = Container.get(TransactionEventService);
      const worker = await spawn<Counter>(new Worker("../../workers/behavior-stats"));

      const data = (await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const value = await txEventService.getListByFilters({ 
            addresses: tokens.map((token) => token.address),
            min_usd_value: 1000,
            time_frame: timeFrame
          });

          return await worker.getDataInTimeFrame(value, timeFrame);
        })
      )).flat();

      const volumeFrames = await worker.getVolumeFrames(data);
      const zoneData = await worker.getVolumeZoneData(timeFrames.map(tf => tf[0]), volumeFrames, data);

      const success = new SuccessResponse(res, {
        data: {
          data: data,
          time_frames: timeFrames.map(tf => tf[0]),
          volume_frames: volumeFrames,
          volume_zones: zoneData,
        },
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async getActivityTrendScore(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { tokenId } = req.params;
    const tokenService = Container.get(TokenService);
    const tokens = await tokenService.getByID(tokenId);
    if (!tokens || tokens.length === 0) {
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 'error',
      });
      error.send();
      return;
    }

    try {
      const now = dayjs();
      const { 
        to_time = now.unix(), 
        period,
        limit = TimeFramesLimit,
      } = req.query;

      const timeFrames = getTimeFramesByPeriod({
        period: period as EPeriod, 
        limit: +limit,
        to_time: +to_time,
      });  

      const txEventService = Container.get(TransactionEventService);
      const worker = await spawn<Counter>(new Worker("../../workers/behavior-stats"));
      const atsWorker = await spawn<ATSCounter>(new Worker("../../workers/activity-trend-score"));      

      const txLogs = (await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const value = await txEventService.getListByFilters({ 
            addresses: tokens.map((token) => token.address),
            min_usd_value: 1000,
            time_frame: timeFrame
          });

          return await worker.getDataInTimeFrame(value, timeFrame);
        })
      )).flat();

      // // TODO:
      const thService = Container.get(DebankTopHoldersService);
      const topHolders = await thService.getByID(tokenId) || await thService.getByID(tokens[0].symbol.toLowerCase());
      const topHolderAddressList = topHolders?.holders?.map((t) => t.user_address);

      const segmentFrames = await atsWorker.getSegmentFrames();
      const chartData = await atsWorker.getScore(timeFrames.map(tf => tf[0]), segmentFrames, txLogs, topHolderAddressList);

      const success = new SuccessResponse(res, {
        data: {
          time_frames: timeFrames.map(tf => tf[0]),
          segment_frames: segmentFrames,
          chart_data: chartData,
        },
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }
}
