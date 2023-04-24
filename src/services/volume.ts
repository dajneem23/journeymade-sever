import _ from '@/types/express';
import { Service, Inject } from 'typedi';
import { ITag, ITagOTD, ITokenVolume } from '../interfaces';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';

@Service()
export default class VolumeService {
  constructor(
    @Inject('volumeModel') private tagModel: Models.VolumeModel,
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  public async bulkSave(items: ITokenVolume[]): Promise<any> {
    const updateOps = items.map((item) => {
      return {
        updateOne: {
          filter: {
            from_time: item.from_time,
            to_time: item.to_time,
            token_address: item.token_address,
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

}
