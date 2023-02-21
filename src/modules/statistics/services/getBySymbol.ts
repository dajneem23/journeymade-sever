import model from '@/models/top-holders-statistics.model';

export const getBySymbol = async ({
  symbol,
  crawl_id
}) => {
  const filter = {}
  if (symbol) filter['symbol'] = symbol;
  if (crawl_id) filter['crawl_id'] = +crawl_id;

  return await model
    .find(filter).select({
      "holders": 0
    }).sort({ crawl_id: -1 }).lean();
};
