import { SMA } from 'technicalindicators';
import { CandlesDataType } from "../types";

export const getMA89 = (candles: CandlesDataType) => {
  const result = SMA.calculate({
    values: candles.map(item => item.b),
    period : 89
  });

  return result.reverse()[0];
}
