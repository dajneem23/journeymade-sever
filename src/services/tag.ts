import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { ITag, ITagOTD } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class TagService {
  constructor(
    @Inject('tagModel') private tagModel: Models.TagModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async getTagList({
    ids,
    offset,
    limit,
  }: ITagOTD): Promise<{ items: ITag[]; itemCount: number }> {
    const filters = {};
    if (ids && ids.length > 0) {
      filters['id'] = { $in: ids };
    }

    const [items, itemCount] = await Promise.all([
      this.tagModel
        .find(filters)
        .skip(offset)
        .limit(limit)
        .select({ updated_at: 0, _id: 0 })
        .lean()
        .exec(),
      this.tagModel.count(filters),
    ]);

    return {
      items,
      itemCount,
    };
  }

  public async insert(items: ITag[]): Promise<any> {
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

    return await this.tagModel.bulkWrite([...updateOps]);
  }

  public async delete(id: string): Promise<any> {
    return await this.tagModel.findOneAndDelete({ id: id }).lean();
  }
}
