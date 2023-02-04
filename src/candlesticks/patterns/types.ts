export enum Reliable {
  VeryWeak = -2,
  Weak = -1,
  Null = 0,
  Strong = 1,
  VeryStrong = 2,
}

export type PatternOutput = {
  name: string;
  description: string;
  potential_position: ['top' | 'bottom' | 'none', Reliable];
  potential_direction: ['up' | 'down' | 'none', Reliable];
};

type PositionValue = ['top' | 'bottom' | 'none', Reliable];
type DirectionValue = ['up' | 'down' | 'none', Reliable];

export type PatternConfigs = {
  start_index: (string | number);
  single_pattern: {
    name: string;
    potential_position: {
      type: PositionValue
      reliability: (object) => number;
      description?: string;
    }
  },
  combo_patterns: {
    indexes: (string | number)[];
    name?: string;
    potential_direction: {
      type: DirectionValue,
      reliability: (object) => number;
      description?: string;
    }
  }[]
}[];

