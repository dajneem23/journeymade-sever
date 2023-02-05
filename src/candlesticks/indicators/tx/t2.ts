import { CandlesDataType, PatternName } from '../../types';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 * t2. |c - UB|/ |UB-BB|=(0;0,2)	"Sắp chạm đường UB trung bình giá Xu hướng Giảm"
 */
export const t2 = (candles: CandlesDataType): FXResult => {
  const { c, bollingerbands: bb } = candles[0];

  let val;
  if (bb && bb.lower) {
    val = Math.abs(c - bb.upper) / Math.abs(bb.upper - bb.lower);
  }

  return {
    value: 0 < val && val < 0.2,
    weight: FXWeight.Top,
    description: `t2: ${PatternName.Bearish}`,
  };
};

/**
 * t2'.|c - UB|/ |UB-BB|=(0;0,4)	"áp lực sắp chạm đường UB trung bình giá. Xu hướng Giảm
 */
export const t2c = (candles: CandlesDataType): FXResult => {
  const { c, bollingerbands: bb } = candles[0];

  let val;
  if (bb && bb.lower) {
    val = Math.abs(c - bb.upper) / Math.abs(bb.upper - bb.lower);
  }

  return {
    value: !t2(candles).value && 0 < val && val < 0.4,
    weight: FXWeight.Top,
    description: `t2c: ${PatternName.Bearish}`,
  };
};
