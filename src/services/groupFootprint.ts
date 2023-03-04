import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { IGroupFootprint, IGroupFootprintOTD } from '../interfaces';

@Service()
export default class GroupFootprintService {
  constructor(
    @Inject('groupFootprintModel')
    private groupFootprintModel: Models.GroupFootprintModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getList({
    token,
    from_time,
    to_time,
    amount = 0,
  }: IGroupFootprintOTD): Promise<{ items: IGroupFootprint[] }> {
    const aggregation = [
      {
        $match: {
          token: token,
          from_time: { $gte: from_time },
          to_time: { $lte: to_time },
        },
      },
      {
        $project: {
          token: 1,
          from_time: 1,
          to_time: 1,
          amount: 1,
          type: 1,
          min_price: 1,
          max_price: 1,
          gid: 1,
          created_at: 1,
          updated_at: 1,

          abs_amount: { $abs: '$amount' },
        },
      },
      {
        $match: {
          abs_amount: { $gte: amount },
        },
      },
    ];

    const [items] = await Promise.all([
      this.groupFootprintModel.aggregate(aggregation).exec(),
    ]);

    return {
      items,
    };
  }

  public async insert(items: IGroupFootprint[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            gid: item.gid,
            type: item.type,
            from_time: item.from_time,
            to_time: item.to_time,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      };
    });

    return await this.groupFootprintModel.bulkWrite([...updateOps]);
  }

  public async delete({ gid, from_time, to_time }): Promise<any> {
    return await this.groupFootprintModel
      .findOneAndDelete({
        gid: gid,
        from_time: from_time,
        to_time: to_time,
      })
      .lean();
  }
}
