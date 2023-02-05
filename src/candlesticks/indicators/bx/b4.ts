import { CandlesDataType, PatternName } from '../../types';
import { sumByFieldOfArray } from '../../utils/index';
import { FXWeight } from '../constants';

/**
 * b4. Volume mua hiện tại/Mean (Volume 3 cây trước)>1,4
 * Volume mua tăng đột biến
 */
export const b4 = (candles: CandlesDataType) => {
  const { buy_volume } = candles[0];

  const meanOf3PrevVolumes =
    sumByFieldOfArray(candles.slice(1, 3), 'buy_volume') / 3;

  return {
    value: buy_volume / meanOf3PrevVolumes > 1.4,
    weight: FXWeight.Bottom,
    description: `b4: ${PatternName.HigherBoughtVolume}`,
  };
};

export const b4c = (candles: CandlesDataType) => {
  const { buy_volume } = candles[0];

  const meanOf3PrevVolumes =
    sumByFieldOfArray(candles.slice(1, 3), 'buy_volume') / 3;

  return {
    value: !b4(candles).value && (buy_volume / meanOf3PrevVolumes > 1.2),
    weight: FXWeight.NextToBottom,
    description: `b4: ${PatternName.BoughtVolumePressure}`,
  };
};
