import { RSI} from 'technicalindicators';

export const getRSI = (candles) => {
  const result = RSI.calculate({
    values: candles.map(item => item.b),
    period : 24
  });
  return result.reverse()[0];
}