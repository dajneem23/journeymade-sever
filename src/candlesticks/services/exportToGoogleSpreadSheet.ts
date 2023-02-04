import { addRows, clearRows, getRows } from '../../google_spreadsheet/index.js';

export const exportToGoogleSpreadSheet = async (tableResult, symbol = '') => {
  Object.keys(tableResult).forEach(async (tf) => {
    const rows = [];

    Object.keys(tableResult[tf]).forEach((key) => {
      if (symbol && key !== symbol) return;

      const raws = [...tableResult[tf][key]].reverse();

      raws.forEach((raw) => {
        if (raw.remaining === 0) {
          const form = {
            id: raw.id,
            time: raw.time,
            symbol: key,
            level: raw.label,
            color: raw.color,
            open: raw.data.a,
            close: raw.data.b,
            high: raw.data.c,
            low: raw.data.d,
            signals: raw.signals ? JSON.stringify(raw.signals) : ''
          };
          rows.push(form);
        }
      });
    });

    if (symbol) {
      const last = rows[rows.length - 1];
      if (last.remaining === 0) {
        await clearRows(tf, {
          start: 2,
          end: 3
        });
        await addRows(tf, [rows[rows.length - 1]]);
      }
    } else {
      await clearRows(tf);
      await addRows(tf, rows);
    }

    // const sheetRows = await getRows(tf);
    // if (sheetRows && sheetRows.length > 0) {
    //   const newRows = rows.filter((item) => {
    //     return !sheetRows.find((sr) => sr.id === item.id);
    //   });

    //   await Promise.all(
    //     sheetRows.map(async (sr) => {
    //       const foundIndex = rows.findIndex((item) => item.id === sr.id);
    //       if (foundIndex > -1) {
    //         Object.keys(rows[foundIndex]).map((key) => {
    //           sheetRows[foundIndex][key] = rows[foundIndex][key];
    //         });
    //         await sheetRows[foundIndex].save();
    //       } else {
    //         await sr.delete();
    //       }
    //     }),
    //   );

    //   if (newRows.length > 0) {
    //     await addRows(tf, rows).then(() => {
    //       'addRows'
    //     });
    //   }
    // } else {
    //   // await clearRows(tf);
    //   await addRows(tf, rows);
    // }
  });
};
