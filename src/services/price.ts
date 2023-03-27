import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { IPrice, IPriceOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class PriceService {
  constructor(
    @Inject('priceModel') private priceModel: Models.PriceModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getPriceList({
    symbol,
    offset,
    limit,
    from_time,
    to_time,
  }: IPriceOTD): Promise<{ items: IPrice[]; itemCount: number }> {
    const filters = {};
    if (symbol) {
      filters['symbol'] = symbol.toUpperCase();
    }
    if (from_time) {
      filters['timestamp'] = { $gte: from_time };
    }

    if (to_time) {
      filters['timestamp'] = { $lte: to_time };
    }

    const [items, itemCount] = await Promise.all([
      this.priceModel
        .find(filters)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.priceModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async getAVGPrice({
    symbol,
    from_time,
    to_time,
  }: IPriceOTD) {
    const value = await this.priceModel
      .aggregate([
        {
          $match: {
            symbol: symbol.toUpperCase(),
            timestamp: {
              $gt: from_time,
              $lte: to_time,
            },
          },
        },
        {
          $project: {
            symbol: 1,
            price: 1,
            usd_value: 1,
            price_gt_0: {
              $cond: { if: { $gt: ['$price', 0] }, then: '$price', else: 0 },
            },
          },
        },
        {
          $group: {
            _id: '$symbol',
            price: { $avg: '$price_gt_0' },
            high: { $max: '$price_gt_0' },
            low: { $min: '$price_gt_0' },
          },
        },
      ])
      .exec();

    return value;
  }

  public async insert(prices: IPrice[]): Promise<any> {
    const updateOps = prices.map((price) => {
      return {
        updateOne: {
          filter: {
            symbol: price.symbol,
            timestamp: price.timestamp,
          },
          update: {
            $set: price,
          },
          upsert: true,
        },
      };
    });

    return await this.priceModel.bulkWrite([...updateOps]);
  }
}
