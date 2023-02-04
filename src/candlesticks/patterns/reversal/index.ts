import bx from '../../indicators/bx/index.js';
import fx from '../../indicators/fx/index.js';
import tx from '../../indicators/tx/index.js';

export { positiveN3 } from './positiveN3.js';

const reversalSignals = (candles) => {
  const length = candles.length;
  for (let i = 0; i < length - 3; i++) {
    const subCandles = candles.slice(i, length - 1);

    const candleFx = {
      ...fx(subCandles.slice(0, 3)),
      ...bx(subCandles),
      ...tx(subCandles),
    };

    candles[i].fx = candleFx;
  }

  // const rsiList = getRSI([...data].reverse());
  // const rsi = rsiList[rsiList.length - 1];
  // const indexLabels = data.map(({ label }) => label);

  // const params = {
  //   ...fx(data.slice(0, 3)),
  //   ...bx(data, {
  //     rsi
  //   }),
  //   ...tx(data, {
  //     rsi
  //   }),
  // };

  const result = [];
  // formulas.forEach(({ start_index, single_pattern, combo_patterns }) => {

  //   // confirm position
  //   const confirmedPosition = single_pattern.potential_position.reliability(input) > minPercentage;
  //   if (confirmedPosition) {
  //     result.push({
  //       start_index,
  //       name: single_pattern.name,
  //       potential_position: single_pattern.potential_position.type
  //     })

  //     combo_patterns.forEach(combo_pattern => {
  //       if (combo_pattern.potential_direction.reliability(input) > minPercentage) {
  //         result.push({
  //           start_index,
  //           name: combo_pattern.name,
  //           potential_direction: combo_pattern.potential_direction.type
  //         })
  //       }
  //     })
  //   }
  // });

  return result;
};

export default reversalSignals;
