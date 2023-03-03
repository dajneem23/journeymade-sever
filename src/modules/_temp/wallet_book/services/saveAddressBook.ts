// import model from '@/models/user-symbol-portfolios.model';
import addressBookModel from '@/models/_temp/address-book.model';
import { WalletInfo } from '../types';

// Update function
function updateOne(filter, update) {
  return {
    updateOne: {
      filter,
      update: {
        $addToSet: update
      },
      upsert: true,
    },
  };
}

export const saveAddressBook = async (
  wallets: WalletInfo[],
) => {
  const updateOps = wallets.map((i) =>
    updateOne(
      {
        address: i.address        
      },
      {
        labels: { '$each': i.labels },
        tags: { '$each': i.tags },
        tokens: { '$each': i.tokens }
      },
    ),
  );

  return await addressBookModel.bulkWrite([...updateOps]);
};
