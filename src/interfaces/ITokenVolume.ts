export interface ITokenVolume {
  from_time: number;
  to_time: number;
  chains: {
    id: string;
    sell: {
      count: number;
      volume: number;
    },
    buy: {
      count: number;
      volume: number;
    }
  }[];
}