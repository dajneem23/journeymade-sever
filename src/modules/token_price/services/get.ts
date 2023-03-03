import model from '@/models/token-price.model';

export const getTokenPrices = async ({ symbol, from_time, to_time }) => {
  return await model.find({
    symbol: { $eq: symbol },
    time_at: { $gte: from_time, $lte: to_time },
  }).lean();
};
