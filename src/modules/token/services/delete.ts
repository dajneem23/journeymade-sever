import model from '@/models/token.model';

export const deleteToken = async (symbol: string) => {
  return await model.findOneAndDelete({ symbol: symbol }).lean();
};
