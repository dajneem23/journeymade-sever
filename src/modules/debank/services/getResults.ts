import model from '@/models/onchain-top-holders-segments.model';

export const getResults = async ({
  symbol,
  limit = 100,
  offset = 0,
  min_pc = 5,
  max_pc = 10000,
}) => {
  const filters: any = {
    abs_percentage_change: {
      '$gte': min_pc,
      '$lte': max_pc
    }
  };

  if (symbol) {
    filters.symbol = symbol;
  }

  // const data = await model.find(filters).skip(offset).limit(limit).sort({ crawl_id: 'desc', updated_at: 'desc' })

  const data = await model.aggregate(
    [
      {
        $addFields: {
          abs_percentage_change: {
            $abs: '$percentage_change',
          },
        },
      },
      {
        $sort: {
          crawl_id: -1.0,
          abs_percentage_change: -1.0,
        },
      },
      { $match: filters },
      {
        $skip: +offset
      },
      {
        $limit: +limit
      },
    ],
    {
      allowDiskUse: true,
    },
  );

  return data;
};
