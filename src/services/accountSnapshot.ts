import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { IAccountSnapshot } from '../interfaces';
import dayjs from '@/utils/dayjs';

@Service()
export default class AccountSnapshotService {
  constructor(
    @Inject('accountSnapshotModel') private accountSnapshotModel: Models.AccountSnapshotModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getAccountSnapshot({
    addresses,
    time,
    offset,
    limit,
  }): Promise<IAccountSnapshot[]> {
    const filter = {};

    if (time) {
      const limitTime = dayjs.unix(time).add(-1, 'day').unix();
      const timeFilter = {
        timestamp: { $lte: time, $gt: limitTime }
      };
      Object.assign(filter, timeFilter);
    }

    if (addresses && addresses.length > 0) {
      Object.assign(filter, { address: { $in: addresses } });
    }

    const cacheDuration = 60 * 30; // 30 mins
    console.log("🚀 ~ file: accountSnapshot.ts:53 ~ AccountSnapshotService ~ filter:", filter)

    const query = () => this.accountSnapshotModel
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .select({ updated_at: 0, _id: 0 })
      .lean()

    const result = await (query() as any)
        .cache(cacheDuration)
        .exec();

    return result;
  }
}
