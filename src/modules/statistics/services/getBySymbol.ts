import model from '@/models/top-holders-statistics.model';

export const getBySymbol = async ({
  symbol
}) => {
  return await model
    .find({ symbol }).select({
      "holders": 0
    }).sort({ crawl_id: -1 }).lean();
};
