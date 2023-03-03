import model from '@/models/account-transactions.model';

export const getAccountTransactionByIds = async ({ ids = [] }) => {
  return await model.find({ id: { $in: ids } }).lean();
};

export const getAccountTransactionsByAddresses = async ({
  token_id,
  token_symbol,
  addresses = [],
  from_time,
  to_time
}) => {
  const filters = { $and: [] }
 
  if (from_time || to_time) {
    const timeFilter = {}
    if (from_time > 0) timeFilter['$gte'] = from_time;
    if (to_time > 0) timeFilter['$lte'] = to_time;

    filters.$and.push(timeFilter)
  }

  if (token_id || token_symbol) {
    const tokenFilter = { $or: [] }

    if (token_id) {
      tokenFilter.$or.push({
        'sends.token_id': token_id
      }, {
        'receives.token_id': token_id
      })
    } else if (token_symbol) {
      tokenFilter.$or.push({
        'sends.token_symbol': token_symbol
      }, {
        'receives.token_symbol': token_symbol
      })
    }

    if (Object.keys(tokenFilter).length > 0) {
      filters.$and.push(tokenFilter);
    }
  }

  filters.$and.push({
    $or: [
      { 'sends.to_addr': { $in: addresses } },
      { 'receives.from_addr': { $in: addresses } },
    ],
  })

  return await model
    .find(filters)
    .lean();
};

export const getAccountsByTags = async ({ tags = [] }) => {
  return await model.find({ tags: { $in: tags } }).lean();
};
