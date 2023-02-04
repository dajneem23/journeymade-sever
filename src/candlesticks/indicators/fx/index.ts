import { CandlesDataType } from '../../types.js';
import { f1 } from './f1.js';
import { f2 } from './f2.js';
import { f3 } from './f3.js';
import { f4 } from './f4.js';
import { f5 } from './f5.js';
import { f6 } from './f6.js';
import { f7 } from './f7.js';
import { f8 } from './f8.js';
import { f9 } from './f9.js';

const fx = (candles: CandlesDataType) => {
  return {
    f1: f1(candles)[0],
    f2: f2(candles)[0],
    f3: f3(candles)[0],
    f4: f4(candles)[0],
    f5: f5(candles)[0],
    f6: f6(candles)[0],
    f7: f7(candles)[0],
    f8: f8(candles)[0],
    f9: f9(candles)[0]
  }
}

export default fx;