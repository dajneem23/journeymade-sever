import { CandlesDataType, PatternName } from '../../types';
import { FXWeight } from '../constants';
import { FXResult } from '../types';

/**
 "t3. (MA89- Price)/MA89= (- vô cùng, -0,2)
"	Đường giá sắp chạm MA89 thường đảo chiều giảm
 */
export const t3 = (candles: CandlesDataType): FXResult => {
  const { b, ma89 } = candles[0];

  return {
    value: (ma89 - b) / ma89 < -0.2,
    weight: FXWeight.Top,
    description: `t3: ${PatternName.Bearish}`,
  };
};

/**
 * "t3'. (MA89- Price)/MA89= (- vô cùng, -0,4)
  Kết quả càng bé thì xu hướng giảm càng mạnh, 
  do trung bình giá đang thấp so với giá"	
  Áp lực đường giá sắp chạm MA89 thường đảo chiều giảm
 */
export const t3c = (candles: CandlesDataType): FXResult => {
  const { b, ma89 } = candles[0];

  return {
    value: !t3(candles).value && ((ma89 - b) / ma89 < -0.4),
    weight: FXWeight.Top,
    description: `t3c: ${PatternName.Bearish}`,
  };
};
