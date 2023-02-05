import { CandleStickItem } from "../../../src/candlesticks/types";
import { getMdcIndex } from "../../../src/candlesticks/utils/mdcIndex";

const data: CandleStickItem[] = [
  {
    cid: '1-230132-100000-BTCUSDT',
    symbol: 'BTCUSDT',
    a: 23611.54,
    b: 23613.86,
    c: 23626.74,
    d: 23609.88,
    volume: 187.24854,
    trades: 5388,
    quote_volume: 4422561.55143,
    buy_volume: 94.33546,
    quote_buy_volume: 2228157.6430777,
    time_stamp: 1675063499999,
    
  },
  {
    cid: '1-230132-100100-BTCUSDT',
    symbol: 'BTCUSDT',
    a: 23623.27,
    b: 23612.03,
    c: 23625.88,
    d: 23599.15,
    volume: 687.63803,
    trades: 10523,
    quote_volume: 16235599.7804544,
    buy_volume: 285.62169,
    quote_buy_volume: 6744382.0256704,
    time_stamp: 1675063439999,
  },
  {
    cid: '1-230132-100200-BTCUSDT',
    symbol: 'BTCUSDT',
    a: 23641.3,
    b: 23623.27,
    c: 23643.62,
    d: 23618.67,
    volume: 346.71182,
    trades: 6175,
    quote_volume: 8192578.6175043,
    buy_volume: 125.18967,
    quote_buy_volume: 2958111.2821039,
    time_stamp: 1675063379999,
  },
  {
    cid: '1-230132-100300-BTCUSDT',
    symbol: 'BTCUSDT',
    a: 23654.81,
    b: 23642.24,
    c: 23658,
    d: 23630.72,
    volume: 307.68771,
    trades: 6264,
    quote_volume: 7274222.7999306,
    buy_volume: 165.82036,
    quote_buy_volume: 3920271.6962549,
    time_stamp: 1675063319999,
  },
  {
    cid: '1-230132-100400-BTCUSDT',
    symbol: 'BTCUSDT',
    a: 23653.56,
    b: 23654.81,
    c: 23660,
    d: 23647.18,
    volume: 117.51309,
    trades: 3841,
    quote_volume: 2779731.0788167,
    buy_volume: 51.43887,
    quote_buy_volume: 1216805.2253217,
    time_stamp: 1675063259999,
  },
];

describe('greeter function', () => {
  // Assert greeter result
  it('greets a user with `Hello, {name}` message', () => {
    const result = getMdcIndex(data[0]);
    expect(result).toEqual({ mdc_index: '5', color: 'green', time: '30/01 14:24' });
  });
});
