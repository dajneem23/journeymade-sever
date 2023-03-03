import model from '@/models/group-wallets.model';

export const deleteGroupWallet = async (id: string) => {
  return await model.findOneAndDelete({ id: id }).lean();
};
