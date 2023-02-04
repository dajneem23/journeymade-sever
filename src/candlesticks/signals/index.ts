import reversalSignals from '../patterns/reversal/index.js';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const sumLastItems = (data) => {
  return data.reduce((accumulator, object) => {
    return accumulator + (typeof object.label == 'number' ? object.label : 0);
  }, 0);
};

const isStartNewCycle = (data) => {
  const length = data.length;
  const prev = data[length - 2];
  const current = data[length - 1];
  if (
    typeof prev?.label === 'string' &&
    typeof current?.label === 'number' &&
    current?.label >= 13
  ) {
    return true;
  }

  return false;
};

const isChangeDirection = (data) => {
  const length = data.length;
  const prev =
    typeof data[length - 2]?.label === 'number' ? data[length - 2]?.label : 0;
  const current =
    typeof data[length - 1]?.label === 'number' ? data[length - 1]?.label : 0;

  if (Math.abs(prev + current) < 8) {
    return true;
  }

  return false;
};

// export const getSignals = (labels) => {
//   const lastIndex = labels.length - 1;

//   const result = {
//     sum_last_3_candlesticks: sumLastItems(labels.slice(lastIndex - 3)),
//     new_cycle: isStartNewCycle(labels.slice(lastIndex - 2)),
//     change_direction: isChangeDirection(labels.slice(lastIndex - 2)),
//   };

//   return result;
// };

export const getSignals = (data) => {
  // console.log("🚀 ~ file: index.ts:56 ~ getSignals ~ data", data)
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

  // const n3 = positiveN3(indexLabels, params);
  // console.log("🚀 ~ file: index.ts:70 ~ getSignals ~ n3", n3)

  // reversalSignals(data)

  const result = []
  // Object.values(params).forEach(val => {
  //   if (val[0]) {
  //     result.push(val[1]);
  //   }
  // })

  return result;
};
