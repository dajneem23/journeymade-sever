import { TimeFramesLimit } from "@/constants";
import { SuccessResponse } from "@/core";
import { EPeriod } from "@/interfaces";
import { CustomRequestType } from "@/loaders/express";
import { activityScoreCounterToken, behaviorCounterToken, volumeCounterToken } from "@/loaders/worker";
import DebankTopHoldersService from "@/services/debankTopHolders";
import TransactionEventService from "@/services/transactionEvent";
import { getTimeFramesByPeriod } from "@/utils";
import dayjs from "dayjs";
import { NextFunction, Response } from "express";
import Container from "typedi";
import { Logger } from "winston";

export async function getActivityTrendScore(req: CustomRequestType, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with params: %o', req.params);

  const token = req.metadata.token;

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
          min_usd_value: 10,
          time_frame: timeFrame,
          actions: ['swap'],
        });

        return await volumeWorker.getBuySellData(value, timeFrame);
      })
    )).flat();
    console.timeEnd('txLogs');

    // // TODO:
    const thService = Container.get(DebankTopHoldersService);
    console.time('topHolders');
    const topHolders = await thService.getByID(token.symbol?.toLowerCase()) || await thService.getByID(token.id);
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
        // tx_logs: txLogs,
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