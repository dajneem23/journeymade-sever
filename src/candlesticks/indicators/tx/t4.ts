import { CandlesDataType, PatternName } from '../../types';
import { sumByFieldOfArray } from '../../utils/index';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 t4. Volume bán hiện tại/Mean (Volume 3 câu trước)>1,4	Volume bán tăng đột biến
 */
export const t4 = (candles: CandlesDataType): FXResult => {
  const { volume, buy_volume } = candles[0];
  const sell_volume = volume - buy_volume;

  const meanOf3PrevVolumes =
    (sumByFieldOfArray(candles.slice(1, 3), 'volume') -
      sumByFieldOfArray(candles.slice(1, 3), 'buy_volume')) /
    3;

  return {
    value: sell_volume / meanOf3PrevVolumes > 1.4,
    weight: FXWeight.Top,
    description: `t4: ${PatternName.HigherSoldVolume}`,
  };
};

/**
 * t4'. Volume bán hiện tại/Mean (Volume 3 câu trước) > 1,2
 * Áp lực Volume bán tăng
 */
export const t4c = (candles: CandlesDataType): FXResult => {
  const { volume, buy_volume } = candles[0];
  const sell_volume = volume - buy_volume;

  const meanOf3PrevVolumes =
    (sumByFieldOfArray(candles.slice(1, 3), 'volume') -
      sumByFieldOfArray(candles.slice(1, 3), 'buy_volume')) /
    3;

  return {
    value: !t4(candles).value && (sell_volume / meanOf3PrevVolumes > 1.2),
    weight: FXWeight.Top,
    description: `t4c: ${PatternName.SoldVolumePressure}`,
  };
};
