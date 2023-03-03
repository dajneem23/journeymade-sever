import model from '@/models/account-transactions.model';

export const deleteAccountTransaction = async (id: string) => {
  return await model.findOneAndDelete({ id: id }).lean();
};
