import model from '@/models/coingeckoTokens.model';

export const getCoingeckoTokens = async () => {
  return await model.aggregate([
    {
      $match: {
        platforms: { $ne: {} },
        $or: [
          { 'platforms.ethereum': { $exists: true } },
          { 'platforms.polygon-pos': { $exists: true } },
          { 'platforms.binance-smart-chain': { $exists: true } },
        ],
        'details.liquidity_score': { $gt: 10 },
        'details.coingecko_rank': { $gt: 0 },
      },
    },
    {
      $sort: {
        'details.coingecko_rank': 1,
      },
    },
    {
      $limit: 1000,
    },
    {
      $project: {
        id: 1,
        name: 1,
        symbol: 1,
        platforms: 1,
        'details.liquidity_score': 1,
        'details.coingecko_rank': 1,
        'details.coingecko_score': 1,
        'details.community_score': 1,
      },
    },
  ]);
};
