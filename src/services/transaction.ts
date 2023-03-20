import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { ITransaction } from '@1foxglobal/onchain-data-model/lib/interfaces';
import { ITransactionOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import dayjs from '@/utils/dayjs';

@Service()
export default class TransactionService {
  constructor(
    @Inject('transactionModel')
    private transactionModel: Models.TransactionModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getList({
    token_id,
    token_symbol,
    addresses = [],
    from_time,
    to_time,
    offset,
    limit,
  }: ITransactionOTD): Promise<{ items: ITransaction[]; itemCount: number }> {
    const filters = { $and: [] };

    if (from_time || to_time) {
      const timeFilter = { time_at: {} };
      if (from_time > 0) timeFilter.time_at['$gte'] = from_time;
      if (to_time > 0) timeFilter.time_at['$lte'] = to_time;

      filters.$and.push(timeFilter);
    }

    if (token_id || token_symbol) {
      const tokenFilter = { $or: [] };

      if (token_id) {
        tokenFilter.$or.push(
          {
            'sends.token_id': token_id,
          },
          {
            'receives.token_id': token_id,
          },
        );
      } else if (token_symbol) {
        tokenFilter.$or.push(
          {
            'sends.token_symbol': token_symbol,
          },
          {
            'receives.token_symbol': token_symbol,
          },
        );
      }

      if (Object.keys(tokenFilter).length > 0) {
        filters.$and.push(tokenFilter);
      }
    }

    filters.$and.push({
      $or: [
        { 'tx.to_addr': { $in: addresses } },
        { 'tx.from_addr': { $in: addresses } },
      ],
    });

    const [items, itemCount] = await Promise.all([
      this.transactionModel
        .find(filters)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.transactionModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async getStats({ offset, limit }) {
    const timestamps = [];
    const now = dayjs().endOf('day');
    for (let i = now; i > now.clone().add(-70, 'day'); i = i.add(-1, 'day')) {
      timestamps.push([i.add(-1, 'day').unix(), i.unix()]);
    }

    const ranges = timestamps.slice(offset, offset + limit);

    const values = await Promise.all(
      ranges.map(async (timestamp) => {
        const value = await this.transactionModel.aggregate([
          {
            $match: {
              chain: { $in: ['ETH', 'BNB'] },
              timestamp: {
                $gt: timestamp[0],
                $lt: timestamp[1],
              },
            },
          },
          {
            $project: {
              symbol: 1,
              price: 1,
              usd_value: 1,
              is_price_gt_0: {
                $cond: { if: { $gt: ['$price', 0] }, then: 1, else: 0 },
              },
            },
          },
          {
            $group: {
              _id: '$symbol',
              count: { $sum: 1 },
              has_price_count: { $sum: '$is_price_gt_0' },
              usd_value: { $sum: '$usd_value' },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
        ]).exec();

        const count = value.reduce((sum, value) => {
          return sum + value.count;
        }, 0);
        const hasPriceCount = value.reduce((sum, value) => {
          return sum + +value.has_price_count;
        }, 0);
        const sumUsdValue = value.reduce((sum, value) => {
          return sum + +value.usd_value;
        }, 0);

        return {
          timestamps: [timestamp[0], timestamp[1]],
          times: [ 
            dayjs(timestamp[0]*1000).format(),
            dayjs(timestamp[1]*1000).format()
          ],
          count,
          has_price_count: hasPriceCount,
          sum_usd_value: sumUsdValue,
          by_token: value,
        }
      }),
    );
    
    return values;
  }

  public async insert(items: ITransaction[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            id: item.hash,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      };
    });

    return await this.transactionModel.bulkWrite([...updateOps]);
  }

  public async delete(id: string): Promise<any> {
    return await this.transactionModel.findOneAndDelete({ id: id }).lean();
  }
}
