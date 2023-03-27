import dayjs from './dayjs';
import { EPeriod } from '../interfaces';

export function getTimestampsByPeriod({
  period = EPeriod['1h'],
  offset = 0,
  limit = 12,
  from_time,
  to_time,
}: {
  period: EPeriod;
  offset?: number;
  limit?: number;
  from_time?: number;
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

  let to = to_time && dayjs.unix(to_time).endOf(unit);
  let from = from_time && dayjs.unix(from_time).startOf(unit);

  if (!to) {
    to = dayjs().endOf(unit);
  }

  if (!from) {
    from = to.clone().add(-70, 'day');
  }
 
  for (let i = to; i.unix() > from.unix(); i = i.add(-1 * step, unit)) {
    timestamps.push([i.add(-1 * step, unit).unix(), i.unix()]);
  }

  return timestamps.slice(offset, offset + limit);
}
