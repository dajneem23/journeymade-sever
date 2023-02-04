import chalk from 'chalk';
import chalkTable from 'chalk-table';
import { highlightLog, infoLog } from '../../printer/index.js';

export const printLogs = (tableResult, symbol = '') => {
  Object.keys(tableResult).forEach((tf) => {
    Object.keys(tableResult[tf]).forEach((key) => {
      if (symbol && key !== symbol) return;

      const raw = [...[...tableResult[tf][key]].slice(0, 9)].reverse();
      const options = {
        columns: [{ field: key, name: chalk.cyan(key) }],
      };

      const data = [
        {
          [key]: `tf: ${tf}`,
        },
      ];

      raw.forEach((item, index) => {
        options.columns.push({
          field: `${index}`,
          name: chalk[item.color](item.mdc_index),
        });

        data[0][`${index}`] = item.time;

        if (item.signals) {
          highlightLog(`${item.time}_${item.label}: `)
          item.signals?.forEach(s => {
            infoLog(s);
          })
        }
      });

      const table = chalkTable(options, data);
      
      console.log(table);
    });
  });
};
