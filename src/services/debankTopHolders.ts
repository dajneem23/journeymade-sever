import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class DebankTopHoldersService {
  constructor(
    @Inject('debankTopHoldersModel')
    private debankTopHoldersModel: Models.DebankTopHoldersModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getByID(id: string) {
    return await this.debankTopHoldersModel
      .findOne({
        id: id,
      })
      .sort({ updated_at: -1 })
      .lean()
      .exec();
  }
  public getStatsById(id: string) {
    return this.debankTopHoldersModel
      .findOne({
        id,
      })
      .sort({ crawl_id: -1 })
      .select({
        id: 1,
        stats: 1,
        updated_at: 1,
      })
      .lean()
      .exec();
  }
}
