import model from '@/models/token.model';
import { IToken } from '@/types';

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

export const upsertTokens = async (tokens: IToken[]) => {
  const updateOps = tokens.map((token) =>
    updateOne(
      {
        symbol: token.symbol,
      },
      token,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
