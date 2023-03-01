import portfoliosModel from '@/models/portfolios.model';
// import model from '@/models/user-symbol-portfolios.model';
import dynamicModel from '@/models/user-portfolios-by-crawlId.model';

export const getPortfolios = async ({
  crawl_id,
  symbol,
  offset = 0,
  limit = 100,
}) => {
  const model = dynamicModel(crawl_id);
  if (!model) {
    throw console.error('no collection', crawl_id);
  }

  return await model
    .find({ symbol })
    .sort({ amount: -1 })
    .skip(offset)
    .limit(limit);
};

export const getPortfoliosByWalletAddress = async ({
  crawl_id,
  symbol,
  wallet_addresses = [],
}) => {
  const model = dynamicModel(crawl_id);
  if (!model) {
    throw console.error('no collection', crawl_id);
  }

  return await model.find({
    symbol,
    wallet_address: { $in: wallet_addresses },
  });
};

export const getPortfoliosByAddresses = async ({
  crawl_date,
  cid,
  symbol,
  addresses = [],
}) => {
  const model = portfoliosModel(crawl_date);  
  if (!model) {
    throw console.error('no collection', crawl_date);
  }

  return await model.find({ address: { $in: addresses }, symbol, cid }).lean()
};
