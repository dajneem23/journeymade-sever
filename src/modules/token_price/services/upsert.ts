import model from '@/models/token-price.model';
import { ITokenPrice } from '@/types';

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

export const upsertTokenPrices = async (token_prices: ITokenPrice[]) => {
  const updateOps = token_prices.map((token_price) =>
    updateOne(
      {
        symbol: token_price.symbol,
        time_at: token_price.time_at
      },
      token_price,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
