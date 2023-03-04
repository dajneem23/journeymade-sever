import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { IPortfolio, IPortfolioOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class PortfolioService {
  constructor(
    @Inject('portfolioModel')
    private portfolioModel: Models.PortfolioModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getList({
    symbol,
    addresses = [],
  }: IPortfolioOTD): Promise<{ items: IPortfolio[]; itemCount: number }> {
    const filters = { symbol: symbol, address: { $in: addresses } };
    const [items, itemCount] = await Promise.all([
      this.portfolioModel
        .find(filters)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.portfolioModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async insert(items: IPortfolio[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            address: item.address,
            symbol: item.symbol,
            ref_id: item.ref_id,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      };
    });

    return await this.portfolioModel.bulkWrite([...updateOps]);
  }

  public async delete(address: string, ref_id): Promise<any> {
    return await this.portfolioModel
      .findOneAndDelete({ address: address, ref_id: ref_id })
      .lean();
  }
}
