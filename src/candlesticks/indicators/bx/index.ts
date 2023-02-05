import { CandlesDataType } from '../../types';
import { b1, b1c } from './b1';
import { b2, b2c } from './b2';
import { b3, b3c } from './b3';
import { b4, b4c } from './b4';
import { sb1, sb2, sb3, sb4 } from './sb';

const bx = (candles: CandlesDataType) => {
  return {
    b1: b1(candles),
    b2: b2(candles),
    b3: b3(candles),
    b4: b4(candles),
    b1c: b1c(candles),
    b2c: b2c(candles),
    b3c: b3c(candles),
    b4c: b4c(candles),
    sb1: sb1(candles),
    sb2: sb2(candles),
    sb3: sb3(candles),
    sb4: sb4(candles),
  };
};

export default bx;
