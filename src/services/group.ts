import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { IGroup, IGroupOTD } from '../interfaces';

@Service()
export default class GroupService {
  constructor(
    @Inject('groupModel') private groupModel: Models.GroupModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getList({
    ids,
    tags,
    tokens,
    offset,
    limit,
  }: IGroupOTD): Promise<{ items: IGroup[]; itemCount: number }> {
    const filter = {};

    if (ids && ids.length > 0) {
      Object.assign(filter, { id: { $in: ids } });
    }

    if (tokens && tokens.length > 0) {
      Object.assign(filter, { token: { $in: tokens } });
    }

    if (tags && tags.length > 0) {
      const tagsFilter = { $or: [] };
      tags.forEach((tag) => {
        tagsFilter.$or.push({ tags: { $regex: tag, $options: 'i' } });
      });
      Object.assign(filter, tagsFilter);
    }

    const [items, itemCount] = await Promise.all([
      this.groupModel
        .find(filter)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.groupModel.count(filter),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async insert(items: IGroup[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            id: item.id,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      };
    });

    return await this.groupModel.bulkWrite([...updateOps]);
  }

  public async delete(id: string): Promise<any> {
    return await this.groupModel.findOneAndDelete({ id: id }).lean();
  }
}
