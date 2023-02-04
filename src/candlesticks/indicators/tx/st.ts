import { CandlesDataType, PatternName } from '../../types.js';
import { FXResult } from '../types.js';

export const st1 = (candles: CandlesDataType): FXResult => {
  const { a, b, c, d } = candles[0];

  return {
    value: Math.abs(a - b) / Math.abs(c - d) < 1 / 10,
    weight: 1,
    description: `st1: ${PatternName.Doji}`,
  };
};

export const st2 = (candles: CandlesDataType): FXResult => {
  const { c, d } = candles[0];
  const { c: c1, d: d1 } = candles[1];

  return {
    value: Math.abs(c - d) / Math.abs(c1 - d1) > 1.2,
    weight: 1,
    description: `st2: ${PatternName.LongLeggedDoji}`,
  };
};

export const st3 = (candles: CandlesDataType): FXResult => {
  const { a, b } = candles[0];

  return {
    value: a - b > 0,
    weight: 1,
    description: `st3: ${PatternName.Red}`,
  };
};

export const st4 = (candles: CandlesDataType): FXResult => {
  const { a, b } = candles[0];
  const { a: a1, b: b1 } = candles[1];

  return {
    value: Math.min(a, b) < (a1 + b1) / 2,
    weight: 1,
    description: `st4: ${PatternName.Bearish}`,
  };
};
