import CandlestickModels from '../../models/1trading_candlesticks.model';

export const saveTableResultToDB = async (tableResult, only_symbol = '') => {
  await Promise.all(
    await Object.keys(tableResult).map(async (tf) => {
      const model = CandlestickModels[tf];
      if (model) {
        // const rows = Object.values(tableResult[tf] as CandleStickItem[]);
        await Object.keys(tableResult[tf]).map(async (symbol) => {
          if (only_symbol && symbol !== only_symbol) return;

          const rows = tableResult[tf][symbol];

          await rows.map(async (row) => {
            const update = {};

            Object.keys(row).forEach((key) => {
              if (!['id'].includes(key)) {
                // const val =
                //   typeof row[key] === 'object'
                //     ? JSON.stringify(row[key])
                //     : row[key];
                update[key] = row[key];
              }
            });

            await model.findOneAndUpdate(
              {
                cid: row.cid
              },
              update,
              {
                upsert: true,
              },
            );
          });
        });
      }
    }),
  );
};
