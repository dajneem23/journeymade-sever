import dayjs from './dayjs';
import { EPeriod } from '../interfaces';
import { TimeFramesLimit } from '@/constants';

export function getTimeFramesByPeriod({
  period = EPeriod['1h'],
  limit = TimeFramesLimit,
  to_time,
}: {
  period: EPeriod;
  limit?: number;
  to_time?: number;
}) {
  let unit: dayjs.OpUnitType = 'hour',
    step = 1;
  switch (period) {
    case EPeriod['1h']:
      unit = 'hour';
      step = 1;
      break;
    case EPeriod['3h']:
      unit = 'hour';
      step = 3;
      break;
    case EPeriod['4h']:
      unit = 'hour';
      step = 4;
      break;  
    case EPeriod['6h']:
      unit = 'hour';
      step = 6;
      break;
    case EPeriod['12h']:
      unit = 'hour';
      step = 12;
      break;
    case EPeriod['1d']:
      unit = 'day';
      step = 1;
      break;
    case EPeriod['7d']:
      unit = 'day';
      step = 7;
      break;
    case EPeriod['3d']:
      unit = 'day';
      step = 3;
      break;
    case EPeriod['30d']:
      unit = 'day';
      step = 30;
      break;
    case EPeriod['90d']:
      unit = 'day';
      step = 90;
      break;
    default:
      unit = 'hour';
      step = 1;
      break;
  }

  const timestamps = [];
  let to = to_time ? dayjs.unix(to_time).endOf(unit) : dayjs().endOf(unit);

  while (timestamps.length < limit) {
    timestamps.unshift([to.add(-1 * step, unit).add(1, 'second').unix(), to.unix(), step, unit]);
    to = to.add(-1 * step, unit);
  }

  return timestamps //.slice(offset, offset + limit);
}
