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
  const step = +period.substring(0, 1);
  const _unit = <dayjs.OpUnitType>period.substring(1, 2).toLowerCase();
  let unit: dayjs.OpUnitType = 'hour';

  switch (_unit) {
    case 'h':
      unit = 'hour'
      break;
    case 'd':  
      unit = 'day'
      break;
    default:
      unit = 'hour';
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
