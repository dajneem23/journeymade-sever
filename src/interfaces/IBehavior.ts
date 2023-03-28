export interface IBehavior {
  tag: string;
  type: 'buy' | 'sell',
  count: number;
  volume: number;
}
