import model from '@/models/onchain-top-holders-segments.model';

export const getResults = async (symbol, limit = 100, offset = 0) => {
  const filters: any = {}
  if (symbol) {
    filters.symbol = symbol
  }
  
  const data = await model.find(filters).skip(offset).limit(limit).sort({ crawl_id: 'desc', updated_at: 'desc' })

  return data;  
};
