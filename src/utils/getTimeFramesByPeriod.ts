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
  const step = +period.substring(0, period.length - 1);
  const _unit = <dayjs.OpUnitType>period.slice(-1).toLowerCase();
  let unit: dayjs.OpUnitType = 'hour';

  switch (_unit) {
    case 'm':
      unit = 'minute'
      break;
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
  let to 

  if (unit === 'minute') {
    to = to_time ? dayjs.unix(to_time).add(step, 'minute') : dayjs().add(step, 'minute');
    const minute = Math.ceil(to.minute() / step) * step - 1;
    to = to.minute(minute).second(59);
  } else {
    to = to_time ? dayjs.unix(to_time).add(step, unit).endOf(unit) : dayjs().add(step, unit).endOf(unit);
  }

  while (timestamps.length <= limit) {
    timestamps.unshift([to.add(-1 * step, unit).add(1, 'second').unix(), to.unix(), step, unit]);
    to = to.add(-1 * step, unit);
  }

  return timestamps //.slice(offset, offset + limit);
}
