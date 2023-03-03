import { getAddressBookByAddresses } from '@/modules/_temp/wallet_book/services/getByAddress';

export const getHotWallets = async (holders) => {
  const addresses = holders
    .filter((h) => h.abs_percentage_change !== 0)
    .map((h) => h.wallet_address);
  const addressBook = await getAddressBookByAddresses({
    wallet_addresses: addresses,
  });

  const result = addresses.map((address) => {
    const found = addressBook.find(({ address: _id }) => {
      _id === address;
    });

    if (found) {
      console.log('found', found);
    }

    const res = { address };
    if (found?.tags?.length > 0) res['tags'] = found?.tags?.join(',');
    if (found?.labels?.length > 0) res['labels'] = found?.labels?.join(',');

    return res;
  });

  return result;
};
