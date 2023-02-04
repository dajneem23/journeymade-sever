import { CandlesDataType } from '../types.js';
import bx from './bx/index.js';
import tx from './tx/index.js';

export const calculateFx = (candles: CandlesDataType) => {
  const length = candles.length;
  for (let i = 0; i < length - 3; i++) {
    const subCandles = candles.slice(i, length - 1);

    const candleFx = {
      ...bx(subCandles),
      ...tx(subCandles),
    };

    const result = {
      items: [],
      fx_point: 0,
      sp_percentage: 0,
    };
    let fxPoint = 0,
      sumSt = 0,
      sumSb = 0;
    const tb = [],
      tbc = [];

    Object.keys(candleFx).forEach((key) => {
      if (candleFx[key].value) {
        if (key.startsWith('st')) {
          sumSt += Number(candleFx[key].value);
        } else if (key.startsWith('sb')) {
          sumSb += Number(candleFx[key].value);
        } else {
          if (key.length > 2) {
            tbc.push(key);
          } else {
            tb.push(key);
          }
        }
      }
    });

    tb.forEach((key) => {
      result.items.push(key);
      fxPoint += Number(candleFx[key].value) * candleFx[key].weight;
    });
    tbc.forEach((key) => {
      if (!result.items.includes(key.substring(0, 1))) {
        result.items.push(key);
        fxPoint += Number(candleFx[key].value) * candleFx[key].weight;
      }
    });

    candles[i].fx_point = fxPoint;
    candles[i].fx_support_per = Math.round(
      ((fxPoint > 0 ? sumSb : sumSt) / 4) * 100,
    );
    candles[i].fx_cases = result.items.join(',');

    // console.log("🚀 ~ file: index.ts:70 ~ calculateFx ~ result", candles[i])
  }
};
