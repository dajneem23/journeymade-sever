import model from '@/models/user-symbol-portfolios.model';
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

export const savePortfolios = async (portfolios: AddressSymbolPortfolios[]) => {
  const updateOps = portfolios.map((p) =>
    updateOne(
      {
        wallet_address: p.wallet_address,
        symbol: p.symbol,
        chain: p.chain,
        crawl_id: p.crawl_id,
        pool_id: p.pool_id,
      },
      p
    ),
  );

return await model.bulkWrite([...updateOps]);
};
