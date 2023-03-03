import model from '@/models/token.model';

export const getAllTokens = async ({ offset = 0, limit = 100 }) => {
  return await model.find().skip(offset).limit(limit).lean();
};

export const getTokensBySymbols = async ({ symbols = [] }) => {
  return await model.find({ symbol: { $in: symbols } }).lean();
};
