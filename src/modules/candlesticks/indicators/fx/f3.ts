import { PatternName } from "../../types";
import { f1 } from "./f1";

/**
 * f3. Nến Doji ngắn hay dài |c-d| hiện tại /|c-d| trước > 1,2 "
 */
export const f3 = (candles) => {
  const { c, d } = candles[0];
  const { c: c1, d: d1 } = candles[1];

  return [
    f1(candles)[0] && Math.abs(c - d) / Math.abs(c1 - d1) > 1.2,
    PatternName.LongLeggedDoji
  ];
};
