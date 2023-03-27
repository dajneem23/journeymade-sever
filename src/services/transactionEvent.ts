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
export default class TransactionEventService {
  constructor(
    @Inject('transactionEventModel')
    private transactionEventModel: Models.TransactionEventModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getStats({ offset, limit }) {
    const timestamps = [];
    const now = dayjs().endOf('day');
    for (let i = now; i > now.clone().add(-70, 'day'); i = i.add(-1, 'day')) {
      timestamps.push([i.add(-1, 'day').unix(), i.unix()]);
    }

    const ranges = timestamps.slice(offset, offset + limit);

    const values = await Promise.all(
      ranges.map(async (timestamp) => {
        const value = await this.transactionEventModel
          .aggregate([
            {
              $match: {
                block_at: {
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
          ])
          .exec();

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
            dayjs(timestamp[0] * 1000).format(),
            dayjs(timestamp[1] * 1000).format(),
          ],
          count,
          has_price_count: hasPriceCount,
          sum_usd_value: sumUsdValue,
          by_token: value,
        };
      }),
    );

    return values;
  }

  public async getLatestBlockNumber() {
    const chainIds = [1, 56];
    const latestBlockNumbers = await Promise.all(
      chainIds.map(async (chain_id) => {
        const latest = await this.transactionEventModel
          .findOne({ chain_id })
          .sort({ blockNumber: -1 })
          .exec();
        return {
          chain_id,
          block_number: latest?.block_number,
        };
      }),
    );

    return latestBlockNumbers;
  }

  public async getMinBlockNumber() {
    const chainIds = [1, 56];
    const minBlockNumbers = await Promise.all(
      chainIds.map(async (chain_id) => {
        const latest = await this.transactionEventModel
          .findOne({ chain_id })
          .sort({ blockNumber: 1 })
          .exec();
        return {
          chain_id,
          block_number: latest?.block_number,
        };
      }),
    );

    return minBlockNumbers;
  }

  public async getLast24hHighUsdValueTxEvent({
    min_usd_value,
    tags,
    symbol,
    offset,
    limit,
  }: any) {
    const now = dayjs().unix();
    const filters = {
      usd_value: { $gt: +min_usd_value || 10000 },
      block_at: { $gt: now - 24 * 60 * 60 },
    };

    if (symbol) {
      filters['symbol'] = symbol.toUpperCase();
    }

    if (tags?.length > 0) {
      filters['$or'] = [
        { from_account_tags: { $in: tags } },
        { to_account_tags: { $in: tags } },
      ];
    }    

    const [items, itemCount] = await Promise.all([
      this.transactionEventModel
        .find(filters)
        .sort({ block_at: -1 })
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.transactionEventModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }
}
