import { CandlesDataType, PatternName } from '../../types';
import { f1 } from './f1';

/**
 * Doji ngắn (ko rõ ràng về giằng co)
 * f2. Nến Doji ngắn hay dài |c-d| hiện tại |c-d| trước <0,8 => )
 */
export const f2 = (candles: CandlesDataType) => {
  const { c, d } = candles[0];
  const { c: c1, d: d1 } = candles[1];

  return [
    f1(candles)[0] && Math.abs(c - d) / Math.abs(c1 - d1) < 0.8,
    PatternName.Doji,
  ];
};
