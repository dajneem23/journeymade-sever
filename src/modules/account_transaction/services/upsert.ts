import model from '@/models/account-transactions.model';
import { IAccountTransaction } from '@/types';

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

export const upsertAccounts = async (transactions: IAccountTransaction[]) => {
  const updateOps = transactions.map((transaction) =>
    updateOne(
      {
        id: transaction.id,
      },
      transaction,
    ),
  );

  return await model.bulkWrite([...updateOps]);
};
