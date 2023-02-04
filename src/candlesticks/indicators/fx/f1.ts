import { CandlesDataType, PatternName } from '../../types.js';

/**
 * Nến Doji xuất hiện
 * |a-b|/|c-d| < 1/10
 */
export const f1 = (candles: CandlesDataType) => {
  const { a, b, c, d } = candles[0];
  return [Math.abs(a - b) / Math.abs(c - d) < 1 / 10, PatternName.Doji];
};
