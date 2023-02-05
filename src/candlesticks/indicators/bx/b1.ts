import { CandlesDataType, PatternName } from "../../types.js";
import { FXWeight } from "../constants.js";
import { FXResult } from "../types.js";

/**
 * b1.RSI <30	Quá mua
 */
export const b1 = (candles: CandlesDataType): FXResult => {
  return {
    value: candles[0]?.rsi < 30,
    weight: FXWeight.Bottom,
    description: `b1: ${PatternName.OverBought}`,
  };
};

export const b1c = (candles: CandlesDataType): FXResult => {
  return {
    value: !b1(candles).value && candles[0]?.rsi < 40,
    weight: FXWeight.NextToBottom,
    description: `b1c: ${PatternName.BuyingPressure}`,
  };
};