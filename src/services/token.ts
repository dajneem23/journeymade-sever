import _ from '@/types/express';
import Container, { Service, Inject } from 'typedi';
import { IToken, ITokenOTD, ITokenResponse } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { ioRedisToken } from '@/loaders/ioredis';

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
    const filters = {
      // enabled: true,
    };
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
  
  public async getEnabledTokenList(): Promise<{ items: IToken[] }> {
    const filters = {
      enabled: true,
      stablecoin: { $exists: false }
    };
  
    const [items] = await Promise.all([
      this.tokenModel
        .find(filters)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
    ]);

    return {
      items,
    };
  }

  public async getCachedTokenById(id) {
    const ioredis = Container.get(ioRedisToken);
    return await ioredis.get(`token:${id}`);
  }

  public async getByID(id) {
    console.log("🚀 ~ file: token.ts:71 ~ TokenService ~ getByID ~ id:", id)
    const ioredis = Container.get(ioRedisToken);

    const cached = await ioredis.get(`token:${id}`);
    let token;
    if (cached) {
      try {
        token = JSON.parse(cached);
        return <ITokenResponse>{
          ...token,
        };
      } catch (e) {
        this.logger.error(e);
      }

      return;
    }

    let tokens;
    try {
      tokens = await this.tokenModel.find({ id }).lean().exec();
      if (!tokens || tokens.length === 0) {
        return;
      }
    } catch (e) {
      this.logger.error(e);
      return;
    }

    return <ITokenResponse>{
      id: tokens[0].id,
      name: tokens[0].name,
      symbol: tokens[0].symbol,
      coingeckoId: tokens[0].coingeckoId,
      logoURI: tokens[0].logoURI,

      chains: tokens.map((t) => {
        return {
          id: t.chainId,
          address: t.address,
          decimals: t.decimals,
          listedIn: t.listedIn,
        };
      }),
    };
  }

  public async insert(tokens: IToken[]): Promise<any> {
    const updateOps = tokens.map((token) => {
      return {
        updateOne: {
          filter: {
            id: token.id,
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
