// import model from '@/models/user-symbol-portfolios.model';
import dynamicModel from '@/models/user-portfolios-by-crawlId.model';
import { AddressSymbolPortfolios } from '../types';

// Update function
function updateOne(filter, update) {
  return {
    updateOne: {
      filter,
      update: {
        $set: update,
      },
      upsert: true,
    },
  };
}

export const savePortfolios = async (
  crawl_id,
  portfolios: AddressSymbolPortfolios[],
) => {
  const updateOps = portfolios.map((p) =>
    updateOne(
      {
        wallet_address: p.wallet_address,
        symbol: p.symbol,
        chain: p.chain,
        crawl_id: p.crawl_id,
        pool_id: p.pool_id,
        ref_id: p.ref_id
      },
      p,
    ),
  );

  const model = dynamicModel(crawl_id);
  if (!model) {
    throw console.error('no collection', crawl_id);
  }

  return await model.bulkWrite([...updateOps]);
};
