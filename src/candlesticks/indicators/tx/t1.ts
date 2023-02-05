import { CandlesDataType, PatternName } from '../../types';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 * t1. RSI >70 => Quá bán
 */
export const t1 = (candles: CandlesDataType): FXResult => {
  return {
    value: candles[0]?.rsi > 70,
    weight: FXWeight.Top,
    description: `t1: ${PatternName.OverSold}`,
  };
};

/**
 * t1', RSI>60	Áp lực Quá bán
 */
export const t1c = (candles: CandlesDataType): FXResult => {
  return {
    value: !t1(candles).value && candles[0]?.rsi > 60,
    weight: FXWeight.NextToTop,
    description: `t1c: ${PatternName.SellingPressure}`,
  };
};

