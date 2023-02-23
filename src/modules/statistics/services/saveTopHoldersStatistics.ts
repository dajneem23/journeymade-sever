import model from '@/models/top-holders-statistics.model';
import { GroupHolders } from '../types';

export const saveTopHoldersStatistics = async (data: GroupHolders) => {
  await model.findOneAndUpdate(
    {
      symbol: data.symbol,
      crawl_id: data.crawl_id,
      id: data.id
    },
    data,
    {
      upsert: true,
    },
  );
};
