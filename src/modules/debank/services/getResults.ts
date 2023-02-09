import model from '@/models/onchain-top-holders-segments.model'
import { SegmentResult } from '../types';

export const getResults = async (limit = 100, offset = 0) => {
  const data = await model.find().skip(offset).limit(limit).sort({ crawl_id: 'desc', updated_at: 'desc' })

  return data;  
};
