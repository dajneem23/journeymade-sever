import model from '@/models/account-portfolios.model';

export const deleteAccountPortfolio = async (
  address: string,
  ref_id: string,
) => {
  return await model
    .findOneAndDelete({ address: address, ref_id: ref_id })
    .lean();
};
