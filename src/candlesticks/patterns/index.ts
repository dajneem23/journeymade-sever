import { CandlesDataType } from '../types';

export const detectPatterns = (candles: CandlesDataType) => {
  // console.log('🚀 ~ file: index.ts:4 ~ detectPatterns ~ candles', candles.length);

  candles.forEach((candle, index) => {
    if (candles[index + 1]) {
      const { fx_point } = candles[index + 1];
      const predict = {
        up: fx_point <= -1,
        down: fx_point >= 1
      };

      const result = {
        up: candle.b > candle.a,
        down: candle.b < candle.a,
      };
      
      if (predict.up || predict.down) {
        candles[index + 1].fx_is_correct = predict.up === result.up && predict.down === result.down;
      }
    }
  })

  return 
};
