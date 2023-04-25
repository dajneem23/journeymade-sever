import {
  EventDispatcher,
  EventDispatcherInterface,
} from '@/decorators/eventDispatcher';
import { Inject, Service } from 'typedi';
import { ITokenVolume } from '../interfaces';

@Service()
export default class VolumeService {
  constructor(
    @Inject('volumeModel') private volumeModel: Models.VolumeModel,
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

    return await this.volumeModel.bulkWrite([...updateOps]);
  }

  public async getListByFilters(
    {
      addresses,
      from_time,
      to_time,
    }: {
      addresses;
      from_time: number,
      to_time: number
    },
    opts?,
  ) {
    const filter = {
      token_address: { $in: addresses || [] },
      from_time: { $gte: from_time },
      to_time: { $lte: to_time }
    };
    const selectOpts = {
      _id: 0,
      ...(opts?.select || {}),
    };

    return await this.volumeModel.find(filter).select(selectOpts).lean().exec();
  }

  public async getListByTokenId(
    {
      token_id,
      from_time,
      to_time,
    }: {
      token_id: string;
      from_time: number,
      to_time: number
    },
    opts?,
  ) {
    const filter = {
      token_id,
      from_time: { $gte: from_time },
      to_time: { $lte: to_time }
    };
    const selectOpts = {
      _id: 0,
      ...(opts?.select || {}),
    };

    return await this.volumeModel.find(filter).select(selectOpts).lean().exec();
  }
}
