import { SuccessResponse } from '@/core';
import AppError from '@/core/appError';
import {
  IToken,
  ITokenDetailResponse,
  ITokenHolderStatsResponse,
  ITokenResponse,
  ITokenSignalResponse,
} from '@/interfaces';
import TransactionEventService from '@/services/transactionEvent';
import { getTimeFramesByPeriod, groupBy, sortArray } from '@/utils';
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

import {
  behaviorCounterToken,
  signalCounterToken,
  volumeCounterToken,
} from '@/loaders/worker';

@Service()
export default class TokenController {
  constructor() {}

  public async getById(req: Request, res: Response, next: NextFunction) {
    const logger: Logger = Container.get('logger');
    logger.debug('Calling get endpoint with query: %o', req.query);

    const { id } = req.params;

    try {
      const service = Container.get(TokenService);
      const token = await service.getByID(id);
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

      const coinMarketService = Container.get(CoinMarketService);
      const market = await coinMarketService.getByID(id);

      const result = <ITokenDetailResponse>{
        ...token,
        market,
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
    console.log(
      '🚀 ~ file: token.ts:116 ~ TokenController ~ getVolume ~ id:',
      id,
    );
    const now = dayjs();
    const {
      to_time = now.unix(),
      period = EPeriod['1h'],
      page = 1,
      limit = TimeFramesLimit,
    } = req.query;
    const offset = +req['skip'] || 0;

    console.time('getVolume');
    console.time('tokenService');
    const tokenService = Container.get(TokenService);
    const token = await tokenService.getByID(id);
    if (!token) {
      console.log(
        '🚀 ~ file: token.ts:128 ~ TokenController ~ getVolume ~ token:',
        token,
      );
      const error = new ErrorResponse(res, {
        message: 'Token not found',
        code: 404,
        data: {},
        status: 404,
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
      const volumeWorker = Container.get(volumeCounterToken);

      console.time('getTxLogs');
      const txLogGroupedByTimeFrame = await Promise.all(
        timeFrames.map(async (timeFrame) => {
          // console.time(`${JSON.stringify(timeFrame)} getTxLogs`);
          const value = await txEventService.getListByFilters({
            symbol: token.symbol,
            addresses: token.chains?.map((token) => token.address) || [],
            min_usd_value: 1,
            time_frame: timeFrame,
            actions: ['swap'],
          });
          // console.timeEnd(`${JSON.stringify(timeFrame)} getTxLogs`);

          return await volumeWorker.getBuySellData(value, timeFrame);
        }),
      );
      console.timeEnd('getTxLogs');
      const txLogs = txLogGroupedByTimeFrame.flat();

      console.time('getVolumeFrames');
      const volumeFrames = await volumeWorker.getVolumeFrames(txLogGroupedByTimeFrame);
      console.timeEnd('getVolumeFrames');

      console.time('getChartData');
      const chartData = await volumeWorker.getChartData(timeFrames, txLogs);
      console.timeEnd('getChartData');

      console.timeEnd('getVolume');
      const success = new SuccessResponse(res, {
        data: {
          // tx_logs: txLogs,
          volume_frames: volumeFrames,
          time_frames: timeFrames.map((tf) => tf[0]),
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
      const stats =
        ids?.debank_id && (await service.getStatsById(ids.debank_id));
      // const items = [
      //   <ITokenHolderStatsResponse>{
      //     name: 'whale',
      //     count: 10,
      //     volume: 100,
      //   },
      //   <ITokenHolderStatsResponse>{
      //     name: 'smart_money',
      //     count: 3,
      //     volume: 20,
      //   },
      //   <ITokenHolderStatsResponse>{
      //     name: 'vc',
      //     count: 1,
      //     volume: 5,
      //   },
      //   <ITokenHolderStatsResponse>{
      //     name: 'market_maker',
      //     count: 2,
      //     volume: 8,
      //   },
      //   <ITokenHolderStatsResponse>{
      //     name: 'kol',
      //     count: 3,
      //     volume: 8,
      //   },
      //   <ITokenHolderStatsResponse>{
      //     name: 'token_fan',
      //     count: 2,
      //     volume: 8,
      //   },
      // ];

      const success = new SuccessResponse(res, {
        data: stats?.stats,
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
      console.time('getTimeFramesByPeriod');
      let subTimeFrameLimit = 24;
      switch (period) {
        case EPeriod['1h']:
          subTimeFrameLimit = 24;
          break;
        case EPeriod['4h']:
          subTimeFrameLimit = 42;
          break;
        case EPeriod['1d']:
          subTimeFrameLimit = 30;
          break;
        case EPeriod['7d']:
          subTimeFrameLimit = 12;
          break;
      }
      const mainTimeFrames = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: +limit,
        to_time: +to_time,
      }).slice(0, +limit);
      // console.log(
      //   '🚀 ~ file: token.ts:342 ~ TokenController ~ getSignals ~ mainTimeFrames:',
      //   mainTimeFrames,
      // );
      const firstTimeFrame = mainTimeFrames[0];
      const prevNTimeFrames = getTimeFramesByPeriod({
        period: period as EPeriod,
        limit: subTimeFrameLimit,
        to_time: firstTimeFrame[0],
      });
      const timeFrames = [...mainTimeFrames, ...prevNTimeFrames];

      console.timeEnd('getTimeFramesByPeriod');

      const txEventService = Container.get(TransactionEventService);
      const volumeWorker = Container.get(volumeCounterToken);
      const signalWorker = Container.get(signalCounterToken);

      const txLogs = (
        await Promise.all(
          timeFrames.map(async (timeFrame) => {
            const txLogsInTimeFrame = await txEventService.getListByFilters({
              symbol: token.symbol,
              addresses: token.chains?.map((token) => token.address) || [],
              min_usd_value: 10,
              time_frame: timeFrame,
              actions: ['swap'],
            });
            return await volumeWorker.getBuySellData(
              txLogsInTimeFrame,
              timeFrame,
            );
          }),
        )
      ).flat();

      const volumes = await volumeWorker.getChartData(timeFrames, txLogs);

      const fullSignals = await signalWorker.getSignals(
        volumes,
        timeFrames.map((tf) => tf[0]),
      );

      const rawSignals = mainTimeFrames
        .map((timeFrame, index) => {
          return {
            timeFrame,
            time_index: index,
            signals: fullSignals.filter(
              (signal) =>
                signal.time_frame.from === timeFrame[0] &&
                signal.time_frame.to === timeFrame[1],
            ),
          };
        })
        .filter((item) => item.signals.length > 0);

      const signals = (
        await Promise.all(
          rawSignals.map(async ({ timeFrame, time_index, signals }) => {
            return <ITokenSignalResponse>{
              title: `Alert: ${signals
                .map((signal) => signal.action)
                .join(', ')}`,
              type: signals.map((signal) => signal.action).join(', '),
              description: '....',
              time_frame: {
                from: timeFrame[0],
                to: timeFrame[1],
              },
              time_index: time_index,
              signals: await Promise.all(
                signals.map(async (signal) => {
                  return {
                    volume: {
                      total: signal.parent.usd_value,
                      total_change_percentage: signal.parent.change_percentage,
                      buy: signal.parent.buy.usd_value,
                      buy_change_percentage:
                        signal.parent.buy.change_percentage,
                      sell: signal.parent.sell.usd_value,
                      sell_change_percentage:
                        signal.parent.sell.change_percentage,
                    },
                    // ...signal,
                    ...(await signalWorker.getLeader(txLogs, signal)),
                  };
                }),
              ),
            };
          }),
        )
      ).flat();

      const success = new SuccessResponse(res, {
        data: {
          time_frames: mainTimeFrames.map((tf) => tf[0]),
          chart_data: signals,
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
