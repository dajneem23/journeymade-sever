import model from '@/models/address-book.model'

export const getAddressBookByAddresses = async ({
  wallet_addresses = []
}) => {
  return await model
    .find({ address: { $in: wallet_addresses } });
};
