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
      filters['symbol'] = symbol;
    }
    if (from_time) {
      filters['time_at'] = { $gte: from_time };
    }

    if (to_time) {
      filters['time_at'] = { $lte: to_time };
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

  public async insert(prices: IPrice[]): Promise<any> {
    const updateOps = prices.map((price) => {
      return {
        updateOne: {
          filter: {
            symbol: price.symbol,
            time_at: price.time_at,
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
