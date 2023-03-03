import model from '@/models/accounts.model';

export const deleteAccount = async (address: string) => {
  return await model.findOneAndDelete({ address: address }).lean();
};
