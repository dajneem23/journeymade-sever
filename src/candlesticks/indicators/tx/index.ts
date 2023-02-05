import { CandlesDataType } from '../../types';
import { st1, st2, st3, st4 } from './st';
import { t1, t1c } from './t1';
import { t2, t2c } from './t2';
import { t3, t3c } from './t3';
import { t4, t4c } from './t4';

const tx = (candles: CandlesDataType) => {
  return {
    t1: t1(candles),
    t2: t2(candles),
    t3: t3(candles),
    t4: t4(candles),
    t1c: t1c(candles),
    t2c: t2c(candles),
    t3c: t3c(candles),
    t4c: t4c(candles),
    st1: st1(candles),
    st2: st2(candles),
    st3: st3(candles),
    st4: st4(candles),
  };
};

export default tx;
