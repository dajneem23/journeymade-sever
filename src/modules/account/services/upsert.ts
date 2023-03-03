import model from '@/models/group-wallets.model';
import { IAccount } from '@/types';

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

export const upsertAccounts = async (accounts: IAccount[]) => {
  const updateOps = accounts.map((account) =>
    updateOne(
      {
        address: account.address,
      },
      account,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
