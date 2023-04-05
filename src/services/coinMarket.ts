import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class CoinMarketService {
  constructor(
    @Inject('coinMarketModel')
    private coinMarketModel: Models.CoinMarketModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getByID(id) {
    return await this.coinMarketModel
      .findOne({
        id: {
          $regex: new RegExp(id, 'ig'),
        },
      })
      .sort({ $natural: -1 })
      .lean()
      .exec();
  }
}
