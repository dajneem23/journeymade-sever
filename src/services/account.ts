import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { IAccount, IAccountGetDTO } from '../interfaces/IAccount';

@Service()
export default class AccountService {
  constructor(
    @Inject('accountModel') private accountModel: Models.AccountModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getAccountList({
    addresses,
    tokens,
    tags,
    offset,
    limit,
  }: IAccountGetDTO): Promise<{ items: IAccount[]; itemCount: number }> {
    const filter = {};

    if (addresses && addresses.length > 0) {
      Object.assign(filter, { address: { $in: addresses } });
    }

    if (tokens && tokens.length > 0) {
      const tokensFilter = { $or: [] };
      tokens.forEach((token) => {
        tokensFilter.$or.push({ tokens: { $regex: token, $options: 'i' } });
      });
      Object.assign(filter, tokensFilter);
    }

    if (tags && tags.length > 0) {
      const tagsFilter = { $or: [] };
      tags.forEach((tag) => {
        tagsFilter.$or.push({ tags: { $regex: tag, $options: 'i' } });
      });
      Object.assign(filter, tagsFilter);
    }

    const [items, itemCount] = await Promise.all([
      this.accountModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.accountModel.count(filter),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async insert(accounts: IAccount[]): Promise<any> {
    const updateOps = accounts.map((account) => {
      return {
        updateOne: {
          filter: {
            address: account.address,
          },
          update: {
            $set: account,
          },
          upsert: true,
        },
      };
    });

    return await this.accountModel.bulkWrite([...updateOps]);
  }

  public async delete(address: string): Promise<any> {
    return await this.accountModel
      .findOneAndDelete({ address: address })
      .lean();
  }
}
