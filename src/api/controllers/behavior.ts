import { ErrorResponse, SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import { NextFunction, Request, Response } from 'express';
import paginate from 'express-paginate';
import { Container, Service } from 'typedi';

import TransactionService from '@/services/transaction';
import TransactionEventService from '@/services/transactionEvent';
import AccountSnapshotService from '@/services/accountSnapshot';
import DebankTopHoldersService from '@/services/debankTopHolders'
import { Logger } from 'winston';
import { EPeriod, ITransaction } from '../../interfaces';
import { getTimeFramesByPeriod } from '@/utils';
import dayjs from '@/utils/dayjs';
import TokenService from '@/services/token';
import { spawn, Thread, Worker } from "threads"
import { BehaviorCounterType, ActivityScoreCounterType } from '@/workers';
import { TimeFramesLimit } from '@/constants';
import { activityScoreCounterToken, behaviorCounterToken, volumeCounterToken } from '@/loaders/worker';

@Service()
export default class BehaviorController {
  constructor() {}

  public async getByTokenId(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with params: %o', req.params);

    const { tokenId } = req.params;
    const tokenService = Container.get(TokenService);
    const token  = await tokenService.getByID(tokenId);
    if (!token) {
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
      const accountSnapshotService = Container.get(AccountSnapshotService);
      const behaviorWorker = Container.get(behaviorCounterToken);
      const volumeWorker = Container.get(volumeCounterToken);

      // console.time('getData');
      const txLogs = (await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const txEvents = await txEventService.getListByFilters({ 
            symbol: token.symbol,
            addresses: token.chains?.map((chain) => chain.address) || [],
            min_usd_value: 1000,
            time_frame: timeFrame,
            actions: ['swap'],
          });

          const group = await volumeWorker.getBuySellData(txEvents, timeFrame);

          // const group = await behaviorWorker.getDataInTimeFrame(txEvents, timeFrame);

          const addressList = group.map((tx) => tx.address);
          if (addressList.length === 0) return group;

          const addressSnapshots = await accountSnapshotService.getAccountSnapshot({
            addresses: addressList,
            time: timeFrame[0],
            offset: 0,
            limit: 1000
          }) || []

          group.forEach((tx) => {
            const found = addressSnapshots.find((snapshot) => snapshot.address === tx.address)
            // if (found) console.log('found', found?.stats?.total_net_usd_value)
            tx.balance_snapshot = found ? found.stats?.total_net_usd_value : null;
          })
          
          return group;
        })
      )).flat();
      // console.timeEnd('getData');
   
      // console.time('volumeFrames');
      const volumeFrames = await behaviorWorker.getVolumeFrames(txLogs);
      // console.timeEnd('volumeFrames');

      // console.time('zoneData');
      const zoneData = await behaviorWorker.getVolumeZoneData(timeFrames.map(tf => tf[0]), volumeFrames, txLogs);
      // console.timeEnd('zoneData');

      const success = new SuccessResponse(res, {
        data: {
          tx_logs: txLogs,
          time_frames: timeFrames.map(tf => tf[0]),
          volume_frames: volumeFrames,
          chart_data: zoneData,
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
    const token  = await tokenService.getByID(tokenId);
    if (!token) {
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
      const behaviorWorker = Container.get(behaviorCounterToken);
      const activityScoreWorker = Container.get(activityScoreCounterToken);
      const volumeWorker = Container.get(volumeCounterToken);
      
      console.time('txLogs');
      const txLogs = (await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const value = await txEventService.getListByFilters({ 
            symbol: token.symbol,
            addresses: token.chains?.map((chain) => chain.address) || [],
            min_usd_value: 1000,
            time_frame: timeFrame,
            actions: ['swap'],
          });        

          return await volumeWorker.getBuySellData(value, timeFrame);
          // return await behaviorWorker.getDataInTimeFrame(value, timeFrame);
        })
      )).flat();
      console.timeEnd('txLogs');

      // // TODO:
      const thService = Container.get(DebankTopHoldersService);
      console.time('topHolders');
      const topHolders = await thService.getByID(token.symbol?.toLowerCase()) || await thService.getByID(tokenId);
      const topHolderAddressList = topHolders?.holders;
      console.timeEnd('topHolders');

      console.time('segmentFrames');
      const segmentFrames = await activityScoreWorker.getSegmentFrames();
      console.timeEnd('segmentFrames');
      
      console.time('getScore');
      const chartData = await activityScoreWorker.getScore(timeFrames.map(tf => tf[0]), segmentFrames, txLogs, topHolderAddressList);
      console.timeEnd('getScore');

      const success = new SuccessResponse(res, {
        data: {
          tx_logs: txLogs,
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
