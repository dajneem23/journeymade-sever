import { TimeFramesLimit } from "@/constants";
import { SuccessResponse } from "@/core";
import { EPeriod } from "@/interfaces";
import { CustomRequestType } from "@/loaders/express";
import PriceService from "@/services/price";
import { getTimeFramesByPeriod } from "@/utils";
import dayjs from "dayjs";
import { NextFunction, Response } from "express";
import Container from "typedi";
import { Logger } from "winston";

export async function getPriceList(req: CustomRequestType, res: Response, next: NextFunction) {
  const logger: Logger = Container.get('logger');
  logger.debug('Calling get endpoint with params: %o', req.params);

  const token = req.metadata.token;

  try {
    const now = dayjs();
    const {
      from_time,
      to_time = now.unix(),
      period,
      page = 1,
      limit = TimeFramesLimit,
    } = req.query;

    const timestamps = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: +limit,
      from_time: +from_time,
      to_time: +to_time,
    });
    
    const service = Container.get(PriceService);
    // console.log("🚀 ~ file: price.ts:66 ~ PriceController ~ timestamps.map ~ timestamps:", timestamps.length)
    const data = await Promise.all(
      timestamps.map(async (timestamp, index) => {
        const value = await service.getAVGPrice({
          token_id: token.id,
          from_time: timestamp[0],
          to_time: timestamp[1],
        });
        const { price, high, low, open, close } = (value && value[0]) || {};

        return {
          from_time: timestamp[0],
          to_time: timestamp[1],
          from_time_str: dayjs
            .unix(timestamp[0])
            .format('YYYY-MM-DD HH:mm:ss'),
          to_time_str: dayjs.unix(timestamp[1]).format('YYYY-MM-DD HH:mm:ss'),
          price: +price,
          high: +high,
          low: +low,
          open: +open,
          close: +close,
          time_index: index
        };
      }),
    );

    const values = data.map((item) => [item.price, item.close]).flat().filter(p => p > 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const success = new SuccessResponse(res, {
      data: {          
        items: data,
        time_frames: timestamps.map((tf) => tf[0]),
        price_ranges: {
          min: min - (max - min) * 0.25 > 0 ? min - (max - min) * 0.25 : 0,
          max: max + (max - min) * 0.25,
        }
      },
    });

    success.send();
  } catch (err) {
    next(err);
  }
}