/* eslint-disable @typescript-eslint/explicit-function-return-type */
import rawDataModel from '../models/rawData.model.js';
import {
  chartTimeFrames,
  symbolFilters
} from './../configs/vars.js';
import { calculateFx } from './indicators/index.js';
import { detectPatterns } from './patterns/index.js';
import { getAllSymbols } from './services/getAllSymbols.js';
import { getPriceBySymbol } from './services/getPriceBySymbol.js';
import { printLogs } from './services/printLogs.js';
import { saveTableResultToDB } from './services/saveTableResultToDB.js';
import { CandleStickRaw } from './types.js';
import { getBB } from './utils/bollingerBands.js';
import { getMA89 } from './utils/maN.js';
import { getMdcIndex } from './utils/mdcIndex.js';
import { getRSI } from './utils/rsi.js';
import { getDataByTimeFrame } from './utils/timeFrame.js';

export const rawData: CandleStickRaw[] = [];
export const tableResult = {};

const prepareChartData = async (symbol, candles) => {
  await Promise.all(
    chartTimeFrames.map((tf) => {
      const tfCandles = getDataByTimeFrame(candles, tf);
      const length = tfCandles.length;
      
      const updatedCandles = tfCandles.map((candle, index) => {
        const { mdc_index, color, time } = getMdcIndex(candle);
        const rsi = getRSI([...tfCandles].slice(index, length - 1).reverse());
        const bollingerbands = getBB([...tfCandles].slice(index, length - 1).reverse());
        const ma89 = getMA89([...tfCandles].slice(index, length - 1).reverse());

        return {
          ...candle,
          mdc_index,
          color,
          time,
          rsi,
          bollingerbands,
          ma89
        };
      });

      calculateFx(updatedCandles);

      if (!tableResult[tf][symbol] || tableResult[tf][symbol].length === 0) {
        tableResult[tf][symbol] = [...updatedCandles];
      } else {
        updatedCandles.forEach((item) => {
          const foundIndex = tableResult[tf][symbol].findIndex((r) => {
            return r && r.symbol === item.symbol && r.time === item.time;
          });

          if (foundIndex > -1) {
            tableResult[tf][symbol][foundIndex] = item;
          } else tableResult[tf][symbol].unshift(item);
        });
      }

      detectPatterns(tableResult[tf][symbol]);
    }),
  );

  // writeJsonFile('tableResult', tableResult);
};

export const initPriceData = async () => {
  chartTimeFrames.forEach((tf) => {
    tableResult[tf] = {};
  });

  await Promise.all(
    rawDataModel.map(async (model) => {
      const symbols =
        symbolFilters?.length > 0 ? symbolFilters : await getAllSymbols(model);

      await Promise.all(
        symbols.map(async (symbol) => {
          const price = await getPriceBySymbol(model, symbol);
          if (price._id) {
            rawData.push(price);
          }
          // writeJsonFile('rawData', rawData);

          await prepareChartData(symbol, price.candles);
        }),
      );
    }),
  );

  printLogs(tableResult);
  // exportToGoogleSpreadSheet(tableResult);
  // writeJsonFile('tableResult', tableResult);
  saveTableResultToDB(tableResult);
};

export const watchChangeData = async () => {
  rawDataModel.map(async (model) => {
    model.watch().on('change', (data: any) => {
      if (!data) return;

      if (data?.operationType === 'update') {
        const updatedFields = data.updateDescription?.updatedFields;

        Object.keys(updatedFields).forEach(async (key) => {
          const foundIdx = rawData.findIndex(
            (r) => r.symbol === updatedFields[key].symbol,
          );

          if (key.includes('candles') && foundIdx > -1) {
            rawData[foundIdx].candles.unshift(updatedFields[key]);
            // writeJsonFile('rawData', rawData);
            // console.log("🚀 ~ file: index.ts:96 ~ Object.keys ~ updatedFields[key]", updatedFields[key])

            await prepareChartData(
              updatedFields[key].symbol,
              rawData[foundIdx].candles,
            );

            printLogs(tableResult, updatedFields[key].symbol);
            // exportToGoogleSpreadSheet(tableResult, updatedFields[key].symbol);
            // writeJsonFile('tableResult', tableResult);
            saveTableResultToDB(tableResult, updatedFields[key].symbol);
          }
        });
      }
    });
  });
};
