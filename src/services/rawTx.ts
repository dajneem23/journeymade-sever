import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { Inject, Service } from 'typedi';

@Service()
export default class RawTxService {
  constructor(
    @Inject('rawTxModel')
    private rawTxModel: Models.RawTxModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getRawTxByHashListByAddress({ filter: { chain_id, from_block, address }, opts: { force_all, limit = 2000 } }) {
    const filter = force_all ? {
      chain_id,
      block_number: { $gte: from_block },
      'logs.address': address, 
    } : {
      chain_id,
      block_number: { $gte: from_block },
      'logs.address': address, 
      processed_on: { $exists: false },
    }

    return await this.rawTxModel
      .find(filter)
      .select({ _id: 0, updated_at: 0 })
      .limit(limit)
      .maxTimeMS(120000)
      .lean()
      .exec();
  }
}
