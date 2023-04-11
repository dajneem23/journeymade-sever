import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import {
  IToken,
  ITokenDetailResponse,
  ITokenHolderStatsResponse,
  ITokenResponse,
  ITokenSignalResponse
} from '@/interfaces';
import TransactionEventService from '@/services/transactionEvent';
import { getTimeFramesByPeriod, groupBy } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import { Container, Service } from 'typedi';

import { TimeFramesLimit } from '@/constants';
import CoinMarketService from '@/services/coinMarket';
import dayjs from '@/utils/dayjs';
import { Logger } from 'winston';
import { ErrorResponse } from '../../core/responseTemplate';
import { EPeriod } from '../../interfaces/EPeriod';
import DebankTopHoldersService from '../../services/debankTopHolders';
import TokenService from '../../services/token';

import { behaviorCounterToken, volumeCounterToken } from '@/loaders/worker';

@Service()
export default class TokenController {
  constructor() {}  

  public async getById(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { id } = req.params;

    try {
      const service = Container.get(TokenService);
      const token  = await service.getByID(id);
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

      const coinMarketService = Container.get(CoinMarketService);
      const market = await coinMarketService.getByID(id);

      const result = <ITokenDetailResponse>{
        ...token,
        market
      };
      const success = new SuccessResponse(res, {
        data: result,
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

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

      const tokens = groupBy(items, 'id');
      const tokenIds = Object.keys(tokens);
      const result = tokenIds.map((id) => {
        const elms = tokens[id];
        return <ITokenResponse>{
          id: elms[0].id,
          name: elms[0].name,
          symbol: elms[0].symbol,
          coingeckoId: elms[0].coingeckoId,
          logoURI: elms[0].logoURI,

          chains: elms.map((t) => t.chainId),
          addresses: elms.map((t) => t.address),
        };
      });

      const success = new SuccessResponse(res, {
        data: {
          items: result,
          has_more: false,
          page: 1,
          total: result.length,
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

    const { id } = req.params;
    const now = dayjs();
    const { 
      to_time = now.unix(),
      period = EPeriod['1h'], page = 1, limit = TimeFramesLimit } = req.query;
    const offset = +req['skip'] || 0;

    console.time('Hello');
    console.time('tokenService');
    const tokenService = Container.get(TokenService);
    const token  = await tokenService.getByID(id);
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
    console.timeEnd('tokenService');
    
    try {
      console.time('getTimeFramesByPeriod');
      const timeFrames = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: +limit,
        to_time: +to_time,
      });
      console.timeEnd('getTimeFramesByPeriod');

      const txEventService = Container.get(TransactionEventService);
     
      // console.time('init behavior worker');
      // const behaviorWorker = await spawn<BehaviorCounterType>(new Worker("../../workers/behavior-stats"));
      // console.timeEnd('init behavior worker');
      
      // console.time('init volume worker');
      // const volumeWorker = await spawn<VolumeCounter>(new Worker("../../workers/volume"));
      // console.timeEnd('init volume worker');

      // console.time('init worker');
      // const [behaviorWorker, volumeWorker] = await Promise.all([
      //   spawn<BehaviorCounterType>(new Worker("../../workers/behavior/worker")),
      //   spawn<VolumeCounterType>(new Worker("../../workers/volume/worker"))
      // ]);
      // console.timeEnd('init worker');

      const volumeWorker = Container.get(volumeCounterToken);

      console.time('getTxLogs');
      const txLogGroupedByTimeFrame = (await Promise.all(
        timeFrames.map(async (timeFrame) => {
          const value = await txEventService.getListByFilters({ 
            symbol: token.symbol,
            addresses: token.chains?.map((token) => token.address) || [],
            min_usd_value: 0,
            time_frame: timeFrame,
            actions: ['swap'],
          });

          return await volumeWorker.getBuySellData(value, timeFrame);
        })
      ));
      console.timeEnd('getTxLogs');
      const txLogs = txLogGroupedByTimeFrame.flat();
      
      console.time('getVolumeFrames');
      const volumeFrames = await volumeWorker.getVolumeFrames(txLogGroupedByTimeFrame);
      console.timeEnd('getVolumeFrames');

      console.time('getChartData');
      const chartData = await volumeWorker.getChartData(timeFrames.map(tf => tf[0]), volumeFrames, txLogs);
      console.timeEnd('getChartData');

      console.time('getPriceRanges');
      const priceRanges = await volumeWorker.getPriceRanges(txLogs);
      console.timeEnd('getPriceRanges');

      console.timeEnd('Hello');
      const success = new SuccessResponse(res, {
        data: {
          tx_logs: txLogs,
          time_frames: timeFrames.map(tf => tf[0]),
          volume_frames: volumeFrames,
          price_ranges: priceRanges,
          chart_data: chartData,
        },
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async getHolderStats(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { id } = req.params;
    const now = dayjs();
    const { to_time = now.unix(), period = EPeriod['1h'], page = 1, limit = TimeFramesLimit } = req.query;
    const offset = +req['skip'] || 0;

    const tokenService = Container.get(TokenService);
    const token  = await tokenService.getByID(id);
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
      const service = Container.get(DebankTopHoldersService);
      const timestamps = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: +limit,
        to_time: +to_time,
      });

      // // TODO:
      // const topHolders = await service.getByID(id) || await service.getByID(tokens[0].symbol.toLowerCase());
      // const topHolderAddressList = topHolders?.holders?.map((t) => t.user_address);
      // console.log("🚀 ~ file: token.ts:236 ~ TokenController ~ getHolderStats ~ topHolders:", topHolderAddressList);

      const items = [
        <ITokenHolderStatsResponse>{
          name: 'whale',
          count: 10,
          volume: 100,
        },
        <ITokenHolderStatsResponse>{
          name: 'smart_money',
          count: 3,
          volume: 20,
        },
        <ITokenHolderStatsResponse>{
          name: 'vc',
          count: 1,
          volume: 5,
        },
        <ITokenHolderStatsResponse>{
          name: 'market_maker',
          count: 2,
          volume: 8,
        },
        <ITokenHolderStatsResponse>{
          name: 'kol',
          count: 3,
          volume: 8,
        },
        <ITokenHolderStatsResponse>{
          name: 'token_fan',
          count: 2,
          volume: 8,
        },
      ];

      const success = new SuccessResponse(res, {
        data: items,
      });

      success.send();
    } catch (err) {
      next(err);
    }
  }

  public async getSignals(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { id } = req.params;
    const now = dayjs();
    const { to_time = now.unix(), period = EPeriod['1h'], page = 1, limit = TimeFramesLimit } = req.query;
    const offset = +req['skip'] || 0;

    const tokenService = Container.get(TokenService);
     const token  = await tokenService.getByID(id);
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
      const service = Container.get(TransactionEventService);
      const timeFrames = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: +limit,
        to_time: +to_time,
      });

      const chartData = timeFrames.map((timeFrame, index) => {
        return <ITokenSignalResponse>{
          title: 'Alert: 123',
          description: 'bullist',
          time_frame: {
            from: timeFrame[0],
            to: timeFrame[1]
          },
          time_index: index,
          holders: [
            <ITokenHolderStatsResponse>{
              name: 'whale',
              count: 10,
              volume: 100,
            },
            <ITokenHolderStatsResponse>{
              name: 'smart_money',
              count: 3,
              volume: 20,
            },
            <ITokenHolderStatsResponse>{
              name: 'vc',
              count: 1,
              volume: 5,
            },
          ],
          lead_zone: {
            tags: ['whale', 'smart_money'],
            address: '0x123',
          }
        }
      });

      const success = new SuccessResponse(res, {
        data: {
          time_frames: timeFrames.map(tf => tf[0]),
          chart_data: chartData
        }
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
