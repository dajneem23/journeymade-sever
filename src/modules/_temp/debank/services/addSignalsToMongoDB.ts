import model from '@/models/onchain-top-holders-segments.model'
import { SegmentResult } from '../types';

export const addSignalsToMongoDB = async (signal: SegmentResult) => {
  await model.findOneAndUpdate(
    {
      symbol: signal.symbol,
      crawl_id: signal.crawl_id,
      segment_id: signal.segment_id
    },
    signal,
    {
      upsert: true,
    },
  );
  
};
