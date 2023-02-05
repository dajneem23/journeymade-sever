import { PatternName } from '../../types';
import {
  PatternConfigs,  
  PatternOutput,
  Reliable,
} from '../types';

const outputTemplate = {
  invertedHammer_bottom:
    'Búa ngược |a-b|/|c-d| > 1/10. Cảnh báo giá đảo chiều hoặc tăng lên khi ở cuối chu kì giảm giá. Cuối chu kí giảm (RSI, MA...). Nếu cây nến búa ngược hình thành có nến xanh marubuzu vượt qua mức cản thì sẽ xác nhận thêm tăng giá',
  gravestoneDoji_bottom:
    'Doji bia mộ (|a-b|/|c-d| < 1/10. Cảnh báo giá đảo chiều hoặc tăng lên khi ở cuối chu kì giảm giá. Cuối chu kí giảm (RSI, MA...). Nếu cây nến Doji bia mộ hình thành có nến xanh marubuzu vượt qua mức cản thì sẽ xác nhận thêm tăng giá',
  shootingStar_top:
    'Sao đổi ngôi |a-b|/|c-d| > 1/10. Mẫu nến búa ngược Cảnh báo giá đảo chiều hoặc giảm khi ở cuối chu kì tăng giá  và thấp hơn giá mở cửa. Cuối chu kì tăng (RSI, MA). Màu đỏ sẽ xác nhận xu hướng mạnh hơn màu xanh',
  gravestoneDoji_top:
    'Doji bia mộ (|a-b|/|c-d| < 1/10. Xuất hiện ở đỉnh, báo hiệu chu kì tăng giá sắp kết thúc. Cảnh báo giá đảo chiều hoặc giảm khi ở cuối chu kì tăng giá  và thấp hơn giá mở cửa. Cuối chu kì tăng (RSI, MA). Màu đỏ sẽ xác nhận xu hướng mạnh hơn màu xanh',
};

const configs: PatternConfigs = [
  {
    start_index: 'n3',
    single_pattern: {
      name: PatternName.InvertedHammer,
      potential_position: {
        type: ['bottom', Reliable.Weak],
        reliability({ b2, f4, f3 }) {
          return (Number(b2) + Number(f4) + Number(f3)) / 3;
        },
        description: 'Nếu búa ngược |a-b|/|c-d| > 1/10',
      },
    },
    combo_patterns: [
      {
        indexes: ['n3', 13],
        name: '[n3,13]',
        potential_direction: {
          type: ['up', Reliable.Null],
          reliability({ f6, f8 }) {
            return Number(f6 || f8);
          },
        },
      },
      {
        indexes: ['n3', 14],
        name: '[n3,14]',
        potential_direction: {
          type: ['up', Reliable.Null],
          reliability({ f6, f8 }) {
            return Number(f6 || f8);
          },
        },
      },
      {
        indexes: ['n3', 15],
        name: '[n3,15]',
        potential_direction: {
          type: ['up', Reliable.Strong],
          reliability({ f6 }) {
            return Number(f6);
          },
        },
      },
    ],
  },
  {
    start_index: 'n3',
    single_pattern: {
      name: PatternName.GravestoneDoji,
      potential_position: {
        type: ['bottom', Reliable.Weak],
        reliability({ f1, b2, f4, f3 }) {
          if (f1) {
            return (Number(b2) + Number(f4) + Number(f3)) / 3;
          }

          return 0;
        },
        description: 'Doji bia mộ (|a-b|/|c-d| < 1/10',
      },
    },
    combo_patterns: [
      {
        indexes: ['n3', 13],
        name: '[n3,13]',
        potential_direction: {
          type: ['up', Reliable.Null],
          reliability({ f6, f8 }) {
            return Number(f6 || f8);
          },
        },
      },
      {
        indexes: ['n3', 14],
        name: '[n3,14]',
        potential_direction: {
          type: ['up', Reliable.Null],
          reliability({ f6, f8 }) {
            return Number(f6 || f8);
          },
        },
      },
      {
        indexes: ['n3', 15],
        name: '[n3,15]',
        potential_direction: {
          type: ['up', Reliable.Strong],
          reliability({ f6 }) {
            return Number(f6);
          },
        },
      },
    ],
  },
  {
    start_index: 'n3',
    single_pattern: {
      name: PatternName.ShootingStar,
      potential_position: {
        type: ['top', Reliable.Strong],
        reliability({ t2, f5, f3 }) {
          return (Number(t2) + Number(f5) + Number(f3)) / 3;
        },
        description: 'Nếu sao đổi ngôi |a-b|/|c-d| > 1/10',
      },
    },
    combo_patterns: [
      {
        indexes: ['n3', -13],
        name: '[n3,-13]',
        potential_direction: {
          type: ['down', Reliable.Null],
          reliability({ f9, f7 }) {
            return Number(f9 || f7);
          },
        },
      },
      {
        indexes: ['n3', -14],
        name: '[n3,-14]',
        potential_direction: {
          type: ['down', Reliable.Null],
          reliability({ f9, f7 }) {
            return Number(f9 || f7);
          },
        },
      },
      {
        indexes: ['n3', -15],
        name: '[n3,-15]',
        potential_direction: {
          type: ['down', Reliable.Strong],
          reliability({ f7 }) {
            return Number(f7);
          },
        },
      },
    ],
  },
  {
    start_index: 'n3',
    single_pattern: {
      name: PatternName.GravestoneDoji,
      potential_position: {
        type: ['top', Reliable.Strong],
        reliability({ f1, t2, f5, f3 }) {
          if (f1) {
            return (Number(t2) + Number(f5) + Number(f3)) / 3;
          }

          return 0;
        },
        description: 'Doji bia mộ (|a-b|/|c-d| < 1/10',
      },
    },
    combo_patterns: [
      {
        indexes: ['n3', -13],
        name: '[n3,-13]',
        potential_direction: {
          type: ['down', Reliable.Null],
          reliability({ f9, f7 }) {
            return Number(f9 || f7);
          },
        },
      },
      {
        indexes: ['n3', -14],
        name: '[n3,-14]',
        potential_direction: {
          type: ['down', Reliable.Null],
          reliability({ f9, f7 }) {
            return Number(f9 || f7);
          },
        },
      },
      {
        indexes: ['n3', -15],
        name: '[n3,-15]',
        potential_direction: {
          type: ['down', Reliable.Strong],
          reliability({ f7 }) {
            return Number(f7);
          },
        },
      },
    ],
  },
];

const minPercentage = 0.5;

export const positiveN3 = (indexes, input) => {
  // console.log('🚀 ~ file: positiveN3.ts:11 ~ positiveN3 ~ input', input);

  // const result: PatternOutput = {
  //   name: '',
  //   description: '',
  //   potential_direction: ['none', Reliable.Null],
  //   potential_position: ['none', Reliable.Null],
  // };
  const result = []
  configs.forEach(({ start_index, single_pattern, combo_patterns }) => {

    // confirm position
    const confirmedPosition = single_pattern.potential_position.reliability(input) > minPercentage;
    if (confirmedPosition) {
      result.push({
        start_index,
        name: single_pattern.name,
        potential_position: single_pattern.potential_position.type
      })


      combo_patterns.forEach(combo_pattern => {
        if (combo_pattern.potential_direction.reliability(input) > minPercentage) {
          result.push({
            start_index,
            name: combo_pattern.name,
            potential_direction: combo_pattern.potential_direction.type
          })
        }
      })
    }
  });
  
  return result;
};
