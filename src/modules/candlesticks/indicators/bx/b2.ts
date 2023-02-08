import { CandlesDataType, PatternName } from '../../types';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 * b2. "Sắp chạm đường LB trung bình giá Xu hướng tăng ( d cũng đc, giá cũng đc)"
 */
export const b2 = (candles: CandlesDataType): FXResult => {
  const { d, bollingerbands: bb } = candles[0];

  let val = null;
  if (bb && bb.lower) {
    val = Math.abs(d - bb.lower) / Math.abs(bb.lower - bb.middle);
  }

  return {
    value: 0 <= val && val < 0.2,
    weight: FXWeight.Bottom,
    description: `b2: ${PatternName.Bullish}`,
  };
};

export const b2c = (candles: CandlesDataType): FXResult => {
  const { d, bollingerbands: bb } = candles[0];

  let val = null;
  if (bb && bb.lower) {
    val = Math.abs(d - bb.lower) / Math.abs(bb.lower - bb.middle);
  }

  return {
    value: !b2(candles).value && 0 <= val && val < 0.4,
    weight: FXWeight.NextToBottom,
    description: `b2c: ${PatternName.Bullish}`,
  };
};
