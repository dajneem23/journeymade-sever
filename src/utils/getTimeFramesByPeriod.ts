import dayjs from './dayjs';
import { EPeriod } from '../interfaces';
import { TimeFramesLimit } from '@/constants';

export function getTimeFramesByPeriod({
  period = EPeriod['1h'],
  limit = TimeFramesLimit,
  from_time,
  to_time,
}: {
  period: EPeriod;
  limit?: number;
  from_time?: number;
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

  switch (unit) {
    case 'minute':
      to = to_time ? dayjs.unix(to_time).add(step, 'minute') : dayjs().add(step, 'minute');
      to = to.minute(Math.ceil(to.minute() / step) * step - 1).second(59);
      break;
    case 'hour':
      to = to_time ? dayjs.unix(to_time).add(step, unit).endOf(unit) : dayjs().add(step, unit).endOf(unit);
      to = to.hour(Math.ceil(to.hour() / step) * step - 1);
      break;
    case 'day':
      to = to_time ? dayjs.unix(to_time).add(step, unit).endOf(unit) : dayjs().add(step, unit).endOf(unit);
      to = to.day(Math.ceil(to.day() / step) * step - 1);  
      break;
  }

  if (from_time > 0 && from_time < to_time) {
    while (from_time < to.unix()) {
      timestamps.unshift([to.add(-1 * step, unit).add(1, 'second').unix(), to.unix(), step, unit]);
      to = to.add(-1 * step, unit);
    }
  } else {
    while (timestamps.length <= limit) {
      timestamps.unshift([to.add(-1 * step, unit).add(1, 'second').unix(), to.unix(), step, unit]);
      to = to.add(-1 * step, unit);
    }
  }

  return timestamps //.slice(offset, offset + limit);
}
