import model from '@/models/group-wallets.model';
import { IGroupWaller } from '@/types';

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

export const upsertGroupWallets = async (groupWallets: IGroupWaller[]) => {
  const updateOps = groupWallets.map((gw) =>
    updateOne(
      {
        id: gw.id,
      },
      gw,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
