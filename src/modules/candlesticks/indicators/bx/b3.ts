import { CandlesDataType, PatternName } from '../../types';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 * "b3. (MA89- Price)/MA89= (0,2, Dương vô cùng)
  Kết quả càng lớn càng tái cân bằng,thì xu hướng tăng càng mạnh"	
  Đường giá sắp chạm MA89 thường đảo chiều tăng
 */
export const b3 = (candles: CandlesDataType): FXResult => {
  const { b, ma89 } = candles[0];

  return {
    value: (ma89 - b) / ma89 >= 0.2,
    weight: FXWeight.Bottom,
    description: `b3: ${PatternName.Bullish}`,
  };
};

export const b3c = (candles: CandlesDataType): FXResult => {
  const { b, ma89 } = candles[0];

  return {
    value: !b3(candles).value && ((ma89 - b) / ma89 >= 0.4),
    weight: FXWeight.NextToBottom,
    description: `b3c: ${PatternName.Bullish}`,
  };
};
