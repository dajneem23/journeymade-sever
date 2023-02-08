import { CandleStickRaw } from "../types";

export const getPriceBySymbol = async (model, symbol: string): Promise<CandleStickRaw> => {
  if (!symbol) return { _id: '', symbol: '', candles: [] };

  const raw = await model.aggregate(
    [
      { $match: { symbol: symbol } },
      { $sort: { created_at: -1 } },
      { $limit: 3 },
      { $unwind: '$candles' },
      {
        $sort: {
          'candles.time_stamp': -1.0,
        },
      },
      {
        $group: {
          _id: '$symbol',
          symbol: {
            $first: '$symbol',
          },
          created_at: {
            $first: '$created_at',
          },
          interval: {
            $first: '$interval',
          },
          candles: {
            $push: '$candles',
          },
        },
      },
    ],
    function (err, results) {
      if (err) throw err;
      return results;
    },
  );

  const data = (raw && raw[0]) || { _id: '', symbol, candles: [] };

  return data;
};
