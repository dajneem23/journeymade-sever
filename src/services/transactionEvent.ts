import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { ITransaction } from '@1foxglobal/onchain-data-model/lib/interfaces';
import { ITransactionOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import dayjs from '@/utils/dayjs';
import { getRecachegooseKey, getTimeFramesByPeriod, removeDuplicateObjects } from '@/utils';

@Service()
export default class TransactionEventService {
  constructor(
    @Inject('transactionEventModel')
    private transactionEventModel: Models.TransactionEventModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async groupByTokenSymbol({ timestamp }) {
    return await this.transactionEventModel
      .aggregate([
        {
          $match: {
            block_at: {
              $gte: timestamp[0],
              $lte: timestamp[1],
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
  }

  public async getStats({ timestamps }) {
    const values = await Promise.all(
      timestamps.map(async (timestamp) => {
        const value = await this.transactionEventModel
          .aggregate([
            {
              $match: {
                block_at: {
                  $gte: timestamp[0],
                  $lte: timestamp[1],
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

        const countValidTokenPrice = value.reduce((sum, value) => {
          return sum + (+value.has_price_count > 0 ? value.count : 0);
        }, 0);

        const hasPriceCount = value.reduce((sum, value) => {
          return sum + +value.has_price_count;
        }, 0);
        const sumUsdValue = value.reduce((sum, value) => {
          return sum + +value.usd_value;
        }, 0);

        const noTokenPriceTokens = value.filter((value) => {
          return +value.count > 0 && +value.has_price_count === 0;
        });

        return {
          timestamps: [timestamp[0], timestamp[1]],
          times: [
            dayjs(timestamp[0] * 1000).format(),
            dayjs(timestamp[1] * 1000).format(),
          ],
          count: countValidTokenPrice,
          has_price_count: hasPriceCount,
          sum_usd_value: sumUsdValue,

          no_token_price_count: noTokenPriceTokens.reduce((sum, value) => {
            return sum + value.count;
          }, 0),
          no_token_price_tokens: noTokenPriceTokens.map((value) => value._id),

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

  public async getVolume({ address_list, timestamp }) {
    const addressOptions = [...address_list, ...address_list.map((address) => address.toLowerCase())];
    
    return await this.transactionEventModel
      .aggregate([
        {
          $match: {
            token: { $in: addressOptions },
            block_at: {
              $gte: timestamp[0],
              $lte: timestamp[1],
            },
          },
        },
        {
          $project: {
            chain_id: 1,
            symbol: 1,
            price: 1,
            usd_value: 1,
            is_price_gt_0: {
              $cond: { if: { $gt: ['$price', 0] }, then: 1, else: 0 },
            },
            is_buy: {
              $cond: {
                if: { $eq: ['$from_account_type', 'liquidity_pool'] },
                then: 1,
                else: 0,
              },
            },
            buy_amount: {
              $cond: {
                if: { $eq: ['$from_account_type', 'liquidity_pool'] },
                then: '$amount',
                else: 0,
              },
            },
            buy_volume: {
              $cond: {
                if: { $eq: ['$from_account_type', 'liquidity_pool'] },
                then: '$usd_value',
                else: 0,
              },
            },
            is_sell: {
              $cond: {
                if: { $eq: ['$to_account_type', 'liquidity_pool'] },
                then: 1,
                else: 0,
              },
            },
            sell_amount: {
              $cond: {
                if: { $eq: ['$to_account_type', 'liquidity_pool'] },
                then: '$amount',
                else: 0,
              },
            },
            sell_volume: {
              $cond: {
                if: { $eq: ['$to_account_type', 'liquidity_pool'] },
                then: '$usd_value',
                else: 0,
              },
            },
          },
        },
        {
          $group: {
            _id: '$chain_id',
            event_count: { $sum: 1 },
            buy_count: { $sum: '$is_buy' },
            buy_amount: { $sum: '$buy_amount' },
            buy_volume: { $sum: '$buy_volume' },

            sell_count: { $sum: '$is_sell' },
            sell_amount: { $sum: '$sell_amount' },
            sell_volume: { $sum: '$sell_volume' },

            usd_value: { $sum: '$usd_value' },
          },
        },
        {
          $sort: {
            usd_value: -1,
          },
        },
      ])
      .exec();
  }

  public async getListByFilters({ symbol, addresses, min_usd_value, time_frame, actions }: {
    symbol?: string, 
    addresses, 
    min_usd_value?: number, 
    time_frame?, 
    actions?: string[]
  }, opts?) {
    let cacheDuration = 60 * 60 * 24; // 24h
    let cacheKey;    

    if (symbol) {
      cacheKey = `${symbol}:${time_frame[0]}-${time_frame[1]}:${min_usd_value}`;
      if (actions?.length > 0) {
        cacheKey += `:${actions.join(',')}`;
      }

      const now = dayjs().unix();
      if (time_frame[1] >= now) {
        cacheDuration = 60 * 1;
      }
    }

    const addressOptions = [...addresses, ...addresses.map((address) => address.toLowerCase())];
    const filter = {
      block_at: {
        $gte: time_frame[0],
        $lte: time_frame[1],
      },      
      token: { $in: addressOptions },
      usd_value: {
        $gt: min_usd_value || 0,
      },
    };
    if (actions?.length > 0) {
      filter['tx_action'] = { $in: actions };
    }

    const selectOpts = {
      _id: 0,
      ...(opts?.select || {})
    }
    
    const query = () => this.transactionEventModel
      .find(filter)
      .select(selectOpts)
      .lean()

    const result = cacheKey ? await (query() as any)
    .cache(cacheDuration, getRecachegooseKey({ module: 'tx-event', id: cacheKey}))
    .exec() : await query().exec();

    const resultWithUniqueKey = result.map(item => {
      return {
        ...item,
        unique_key: `${item.tx_hash}-${item.log_index}`,
      }
    })

    return removeDuplicateObjects(resultWithUniqueKey, 'unique_key');
  }

  public async getByTxHash({ tx_hash }) {
    const query = () => this.transactionEventModel
    .find({ tx_hash })
    .lean()

    const result = await query().exec();

    const resultWithUniqueKey = result.map(item => {
      return {
        ...item,
        unique_key: `${item.tx_hash}-${item.log_index}`,
      }
    })

    return removeDuplicateObjects(resultWithUniqueKey, 'unique_key');
  }
}
