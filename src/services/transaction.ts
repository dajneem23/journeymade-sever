import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { ITransaction, ITransactionOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

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
    const filters = { $and: [] }
 
    if (from_time || to_time) {
      const timeFilter = { time_at: {}}
      if (from_time > 0) timeFilter.time_at['$gte'] = from_time;
      if (to_time > 0) timeFilter.time_at['$lte'] = to_time;
  
      filters.$and.push(timeFilter)
    }
  
    if (token_id || token_symbol) {
      const tokenFilter = { $or: [] }
  
      if (token_id) {
        tokenFilter.$or.push({
          'sends.token_id': token_id
        }, {
          'receives.token_id': token_id
        })
      } else if (token_symbol) {
        tokenFilter.$or.push({
          'sends.token_symbol': token_symbol
        }, {
          'receives.token_symbol': token_symbol
        })
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
    })

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

  public async insert(items: ITransaction[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            id: item.id,
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
