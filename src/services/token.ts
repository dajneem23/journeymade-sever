import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { IToken, ITokenOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class TokenService {
  constructor(
    @Inject('tokenModel') private tokenModel: Models.TokenModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getTokenList({
    symbols,
    offset,
    limit,
  }: ITokenOTD): Promise<{ items: IToken[]; itemCount: number }> {
    const filters = {};
    if (symbols && symbols.length > 0) {
      filters['symbol'] = { $in: symbols };
    }
    const [items, itemCount] = await Promise.all([
      this.tokenModel
        .find(filters)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.tokenModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async insert(tokens: IToken[]): Promise<any> {
    const updateOps = tokens.map((token) => {
      return {
        updateOne: {
          filter: {
            symbol: token.symbol,
          },
          update: {
            $set: token,
          },
          upsert: true,
        },
      };
    });

    return await this.tokenModel.bulkWrite([...updateOps]);
  }

  public async delete(symbol: string): Promise<any> {
    return await this.tokenModel.findOneAndDelete({ symbol: symbol }).lean();
  }
}
