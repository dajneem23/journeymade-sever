import model from '@/models/account-port';

export const getAccountPortfoliosByAddressSymbol = async ({
  symbol,
  addresses = [],
}) => {
  return await model
    .find({ symbol: symbol, address: { $in: addresses } })
    .lean();
};
