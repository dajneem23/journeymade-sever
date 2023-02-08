import dayjs from 'dayjs';
import { CandleStickItem, MDCIndexOutput } from '../types';

const configs = {
  fiboRanges: [
    [0, 0.236],
    [0.236, 0.382],
    [0.382, 0.5],
    [0.5, 0.618],
    [0.618, 0.786],
    [0.786, 1.001],
  ],
  indexLabels: [
    ['n3', '5', '9', '12', '14', '15'],
    ['-1', 'n2', '4', '8', '11', '13'],
    ['-6', '-2', 'n1', '3', '7', '10'],
    ['-10', '-7', '-3', '-n1', '2', '6'],
    ['-13', '-11', '-8', '-4', '-n2', '1'],
    ['-15', '-14', '-12', '-9', '-5', 'n3'],
  ],
};

const prepareFiboRanges = (c: number, d: number) => {
  const result = [];
  configs.fiboRanges.forEach((range) => {
    const min = range[0],
      max = range[1];

    const from = min === 0 ? d : (c - d) * min + d;
    const to = max === 1 ? c : (c - d) * max + d;

    result.push([from, to]);
  });

  return result;
};

/**
 *
 * a: open price
 * b: close price
 * c: max price
 * d: min price
 */
export const getMdcIndex = (input: CandleStickItem): MDCIndexOutput => {
  const { a, b, c, d, remaining } = input;

  const fiboRanges = prepareFiboRanges(c, d);
  const aIndex = fiboRanges.findIndex((row) => row[0] <= a && a < row[1]);
  const bIndex = fiboRanges.findIndex((row) => row[0] <= b && b < row[1]);

  if (aIndex === -1) {
    console.log('not found aIndex', a);
    // console.table(fiboRanges);
  }
  if (bIndex === -1) {
    console.log('not found bIndex', a);
    // console.table(fiboRanges);
  }

  const mdc_index = configs.indexLabels[aIndex]
    ? configs.indexLabels[aIndex][bIndex]
    : null;
  const color = b - a > 0 ? 'green' : 'red';
  const time = dayjs.unix(input.time_stamp / 1000).format('DD/MM HH:mm');
 
  return {
    mdc_index: remaining > 0 ? `[${mdc_index}]` : mdc_index,
    color,
    time,
  };
};
