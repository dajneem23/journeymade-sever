import model from '@/models/group-wallets.model';

export const getGroupWalletByIds = async ({ ids = [] }) => {
  return await model.find({ id: { $in: ids } }).lean();
};

export const getGroupWalletByTokens = async ({ tokens = [] }) => {
  return await model.find({ token: { $in: tokens } }).lean();
};

export const getGroupWalletByTags = async ({ tags = [] }) => {
  return await model.find({ tags: { $in: tags } }).lean();
};
