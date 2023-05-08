export function getTimeBucketInterval(period, limit) {
  const step = +period.substring(0, period.length - 1);
  const _unit = period.slice(-1).toLowerCase();
  let unit = 'hour';

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

  const interval = `${step} ${step > 1 ? unit + 's' : unit}`;
  const minTime = `${step * (limit + 1)} ${unit}s`;

  return {
    interval,
    minTime,
  }
}