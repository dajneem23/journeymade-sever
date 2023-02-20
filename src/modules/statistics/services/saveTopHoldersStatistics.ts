import model from '@/models/top-holders-statistics.model';
import { Output } from '../types';

export const saveTopHoldersStatistics = async (data: Output) => {
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
