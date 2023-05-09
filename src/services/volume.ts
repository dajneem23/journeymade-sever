import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import Container, { Inject, Service } from 'typedi';
import { EPeriod, IChartDataVolume, ITokenVolume } from '../interfaces';
import { pgPoolToken } from '@/loaders/postgres';
import fs from 'fs';
import { flattenArray, getTimeBucketInterval, getTimeFramesByPeriod, groupBy } from '@/utils';
import dayjs from '@/utils/dayjs';
import { volumeCounterToken } from '@/loaders/worker';
import { VolumeCounterType } from '@/workers';

const VolumeViewSQL = fs.readFileSync(__dirname + '/queries/volume-view.sql').toString();
const VolumeSQL = fs.readFileSync(__dirname + '/queries/volume.sql').toString();

@Service()
export default class VolumeService {
  constructor(
    @Inject('volumeModel') private volumeModel: Models.VolumeModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async bulkSave(items: ITokenVolume[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            from_time: item.from_time,
            to_time: item.to_time,
            token_address: item.token_address,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      };
    });

    return await this.volumeModel.bulkWrite([...updateOps]);
  }

  public async getListByFilters(
    {
      addresses,
      from_time,
      to_time,
    }: {
      addresses;
      from_time: number,
      to_time: number
    },
    opts?,
  ) {
    const filter = {
      token_address: { $in: addresses || [] },
      from_time: { $gte: from_time },
      to_time: { $lte: to_time }
    };
    const selectOpts = {
      _id: 0,
      ...(opts?.select || {}),
    };

    return await this.volumeModel.find(filter).select(selectOpts).lean().exec();
  }

  public async getListByTokenId(
    {
      token_id,
      from_time,
      to_time,
    }: {
      token_id: string;
      from_time: number,
      to_time: number
    },
    opts?,
  ) {
    const filter = {
      token_id,
      from_time: { $gte: from_time },
      to_time: { $lte: to_time }
    };
    const selectOpts = {
      _id: 0,
      ...(opts?.select || {}),
    };

    return await this.volumeModel.find(filter).select(selectOpts).lean().exec();
  }

  public async getHistoricalVolume(
    {
      token_id,
      period,
      limit,
      to_time,
    }: {
      token_id: string,
      period: string,
      limit: number,
      to_time: number
    },
    opts?,
  ) {
    const volumeWorker: VolumeCounterType = Container.get(volumeCounterToken);
    const pool = Container.get(pgPoolToken);
    let sql = VolumeSQL;

    const timeFrames = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: +limit,
      to_time: +to_time,
    });


    const {
      interval,
      minTime
    } = getTimeBucketInterval(period, limit);

    const fromTime = timeFrames[0][0];
    const toTime = timeFrames[timeFrames.length - 1][1];
    const basePeriod = period.includes('d') ? '1m' : period.includes('h') ? '1h' : '5m';
    const tableName = `volume_${basePeriod}`;

    sql = sql.replaceAll('$4', `'${dayjs.unix(fromTime).utc().format('YYYY-MM-DD HH:mm:ss')}'`);
    sql = sql.replaceAll('$5', `'${dayjs.unix(toTime).utc().format('YYYY-MM-DD HH:mm:ss')}'`);
    sql = sql.replaceAll('$6', `'${interval}'`);

    try {      
      const raws: Array<any> = await new Promise((resolve, reject) => {
        pool.query(sql, [interval, token_id, tableName], (err, result) => {
          if (err) {
            console.error('Error executing query', err.stack)
            return reject(err);
          }

          resolve(result.rows);
        })   
      });

      if (!raws || !raws.length) { return {
          timeFrames: timeFrames.map((tf) => tf[0]),
          chartData: [],
          volumeFrames: []
        } 
      }

      const chartData: Array<IChartDataVolume> = raws.map((raw, idx) => {
        if (!raw.time_bucket) { return null; }

        const timestamp = dayjs.utc(raw.time_bucket).unix();
        const timeIndex = timeFrames.findIndex((time) => time[0] <= timestamp && timestamp <= time[1]);

        let changePercentage = null;
        if (raws[idx - 1]) {
          const prevRaw = raws[idx - 1];
          changePercentage = {
            total: 0,
            buy: 0,
            sell: 0,
          }
          if (+prevRaw.total_usd_value > 0) {
            changePercentage.total = (+raw.total_usd_value - +prevRaw.total_usd_value) / +prevRaw.total_usd_value;
          }

          if (+prevRaw.buy_usd_value > 0) {
            changePercentage.buy = (+raw.buy_usd_value - +prevRaw.buy_usd_value) / +prevRaw.buy_usd_value;
          }

          if (+prevRaw.sell_usd_value > 0) {
            changePercentage.sell = (+raw.sell_usd_value - +prevRaw.sell_usd_value) / +prevRaw.sell_usd_value;
          }
        }

        return <IChartDataVolume>{
          time_bucket: raw.time_bucket,
          timestamp: timestamp,
          time_index: timeIndex,
          period,
          count: +raw.total_count,
          amount: +raw.total_amount,
          usd_value: +raw.total_usd_value,
          price: +raw.close_price,
          buy: {
            count: +raw.buy_count,
            amount: +raw.buy_amount,
            usd_value: +raw.buy_usd_value,
            change_percentage: changePercentage?.buy,
          },
          sell: {
            count: +raw.sell_count,
            amount: +raw.sell_amount,
            usd_value: +raw.sell_usd_value,
            change_percentage: changePercentage?.sell,
          },
          open_price: +raw.open_price,
          close_price: +raw.close_price,
          high_price: +raw.high_price,
          low_price: +raw.low_price,

          change_percentage: changePercentage?.total,
        }
      }).filter(Boolean);

      const maxVolume = Math.max(...chartData.map((item) => item.usd_value));
      const volumeFrames = await volumeWorker.getVolumeFrameOptions(maxVolume);

      return {
        timeFrames: timeFrames.map((tf) => tf[0]),
        volumeFrames,
        chartData,
      }

    } catch (e) {
      console.log("🚀 ~ file: volume.ts:120 ~ VolumeService ~ e:", e)
    }

    return {
      timeFrames: timeFrames.map((tf) => tf[0]),
      chartData: [],
      volumeFrames: []
    }
  }

  public async getLatestVolume({
    token_id,
    period,
    limit,
    to_time,
  }: {
    token_id: string,
    period: string,
    limit: number,
    to_time: number
  }) {
    const volumeWorker: VolumeCounterType = Container.get(volumeCounterToken);
    const pool = Container.get(pgPoolToken);
    let sql = VolumeViewSQL;  

    const timeFrames = getTimeFramesByPeriod({
      period: period as EPeriod,
      limit: +limit,
      to_time: +to_time,
    });

    const {
      interval,
      minTime
    } = getTimeBucketInterval(period, limit);
    
    const fromTime = timeFrames[0][0];
    const toTime = timeFrames[timeFrames.length - 1][1];
    sql = sql.replaceAll('$4', `'${dayjs.unix(fromTime).utc().format('YYYY-MM-DD HH:mm:ss')}'`);
    sql = sql.replaceAll('$5', `'${dayjs.unix(toTime).utc().format('YYYY-MM-DD HH:mm:ss')}'`);

    try {
      const raws: Array<any> = await new Promise((resolve, reject) => {
        pool.query(sql, [interval, token_id, period], (err, result) => {
          if (err) {
            console.error('Error executing query', err.stack)
            return reject(err);
          }

          resolve(result.rows);
        })   
      });

      if (!raws || !raws.length) { return {
          timeFrames: timeFrames.map((tf) => tf[0]),
          chartData: [],
          volumeFrames: []
        } 
      }

      const chartData: Array<IChartDataVolume> = raws.map((raw, idx) => {
        if (!raw.time_bucket) { return null; }

        const timestamp = dayjs.utc(raw.time_bucket).unix();
        // console.log("🚀 ~ file: volume.ts:150 ~ raw.time_bucket:", raw.time_bucket, timestamp)
        const timeIndex = timeFrames.findIndex((time) => time[0] <= timestamp && timestamp <= time[1]);

        let changePercentage = null;
        if (raws[idx - 1]) {
          const prevRaw = raws[idx - 1];
          changePercentage = {
            total: 0,
            buy: 0,
            sell: 0,
          }
          if (+prevRaw.total_usd_value > 0) {
            changePercentage.total = (+raw.total_usd_value - +prevRaw.total_usd_value) / +prevRaw.total_usd_value;
          }

          if (+prevRaw.buy_usd_value > 0) {
            changePercentage.buy = (+raw.buy_usd_value - +prevRaw.buy_usd_value) / +prevRaw.buy_usd_value;
          }

          if (+prevRaw.sell_usd_value > 0) {
            changePercentage.sell = (+raw.sell_usd_value - +prevRaw.sell_usd_value) / +prevRaw.sell_usd_value;
          }
        }

        return <IChartDataVolume>{
          time_bucket: raw.time_bucket,
          timestamp: timestamp,
          time_index: timeIndex,
          period,
          count: +raw.total_count,
          amount: +raw.total_amount,
          usd_value: +raw.total_usd_value,
          price: +raw.close_price,
          buy: {
            count: +raw.buy_count,
            amount: +raw.buy_amount,
            usd_value: +raw.buy_usd_value,
            change_percentage: changePercentage?.buy,
          },
          sell: {
            count: +raw.sell_count,
            amount: +raw.sell_amount,
            usd_value: +raw.sell_usd_value,
            change_percentage: changePercentage?.sell,
          },
          open_price: +raw.open_price,
          close_price: +raw.close_price,
          high_price: +raw.high_price,
          low_price: +raw.low_price,

          change_percentage: changePercentage?.total,
        }
      }).filter(Boolean);

      const maxVolume = Math.max(...chartData.map((item) => item.usd_value));
      const volumeFrames = await volumeWorker.getVolumeFrameOptions(maxVolume);

      return {
        timeFrames: timeFrames.map((tf) => tf[0]),
        volumeFrames,
        chartData,
      }

    } catch (e) {
      console.log("🚀 ~ file: volume.ts:120 ~ VolumeService ~ e:", e)
    }

    return {
      timeFrames: timeFrames.map((tf) => tf[0]),
      chartData: [],
      volumeFrames: []
    }
  }
}
