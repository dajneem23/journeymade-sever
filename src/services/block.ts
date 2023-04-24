import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { ioRedisToken } from '@/loaders/ioredis';
import Container, { Inject, Service } from 'typedi';
import { ITokenResponse } from '../interfaces';

@Service()
export default class BlockService {
  constructor(
    @Inject('blockModel') private blockModel: (chain) => Models.BlockModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {
  }

  public async getBlockStatByTimestamp(chain: string, timestamp: number) {
    const modelInstant = this.blockModel(chain);
    return await modelInstant.findOne({
      timestamp: { $lt: timestamp }
    })
    .sort({ timestamp: -1 })
    .select({ tx_hash: 0 })
    .maxTimeMS(120000)
    .lean()
    .exec();
  }
}
