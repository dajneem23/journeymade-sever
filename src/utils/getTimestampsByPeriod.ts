import dayjs from './dayjs';

type Period = '1h' | '3h' | '6h' | '12h' | '1d' | '1w' | '1m' | '3m';

export function getTimestampsByPeriod(period: Period, offset = 0, limit = 10) {
  let unit: dayjs.OpUnitType = 'hour',
    step = 1;
  switch (period) {
    case '1h':
      unit = 'hour';
      step = 1;
      break;
    case '3h':
      unit = 'hour';
      step = 3;
      break;
    case '6h':
      unit = 'hour';
      step = 6;
      break;
    case '12h':
      unit = 'hour';
      step = 12;
      break;
    case '1d':
      unit = 'day';
      step = 1;
      break;
    case '1w':
      unit = 'week';
      step = 1;
      break;
    case '1m':
      unit = 'month';
      step = 1;
      break;
    case '3m':
      unit = 'month';
      step = 3;
      break;
    default:
      unit = 'hour';
      step = 1;
      break;
  }

  const timestamps = [];
  const now = dayjs().endOf(unit);
  const min = now.clone().add(-70, 'day');
  for (let i = now; i > min; i = i.add(-1 * step, unit)) {
    timestamps.push([i.add(-1 * step, unit).unix(), i.unix()]);
  }

  return timestamps.slice(offset, offset + limit);
}
