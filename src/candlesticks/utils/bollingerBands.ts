import { BollingerBands } from 'technicalindicators';

export const getBB = (candles) => {
  const result = BollingerBands.calculate({
    values: candles.map(item => item.b),
    period : 14,
    stdDev : 2
  });
  return result.reverse()[0];
}
