import model from '@/models/tokens.model';

export const getSymbols = async () => {
  return await model.find({
    usd_value: { '$gt': 0 }
  }).sort({ _id: 1 }).lean();
};
