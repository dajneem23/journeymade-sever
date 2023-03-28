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

  public async getAVGPrice({
    token_id,
    from_time,
    to_time,
  }: IPriceOTD) {
    const value = await this.priceModel
      .aggregate([
        {
          $match: {
            token_id: token_id,
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
