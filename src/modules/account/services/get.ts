import model from '@/models/group-wallets.model';

export const getAccountsByIds = async ({ addresses = [] }) => {
  return await model.find({ address: { $in: addresses } }).lean();
};

export const getAccountsByTokens = async ({ tokens = [] }) => {
  return await model.find({ tokens: { $in: tokens } }).lean();
};

export const getAccountsByTags = async ({ tags = [] }) => {
  return await model.find({ tags: { $in: tags } }).lean();
};
