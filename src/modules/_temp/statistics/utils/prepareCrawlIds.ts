import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { CrawlDuration } from '../configs';
import { periodOptions } from '../types';

dayjs.extend(utc);
dayjs.extend(timezone);

// 2023022003, 22101
export default function ({ crawl_id }) {
  const now = dayjs();
  const crawlId = String(crawl_id);
  const crawlIdLength = crawlId.length;

  const elements = {
    year: crawlIdLength > 8 ? crawlId.substring(0, 4) : now.format('YYYY'),
    month:
      crawlIdLength > 8
        ? crawlId.substring(4, 6)
        : now
            .set('month', +crawlId.substring(0, crawlIdLength - 4) - 1)
            .format('MM'),
    day:
      crawlIdLength > 8
        ? crawlId.substring(6, 8)
        : crawlId.substring(crawlIdLength - 4, crawlIdLength - 2),
    tid: crawlId.substring(crawlIdLength - 2),
    hour: (+crawlId.substring(crawlIdLength - 2) - 1) * CrawlDuration,
  };

  const cursor = dayjs
    .utc()
    .set('year', +elements.year)
    .set('month', +elements.month - 1)
    .set('date', +elements.day)
    .set('hour', +elements.hour)
    .set('minute', 0)
    .set('second', 0);

  const ids = [];
  periodOptions.map((period) => {
    const tick = cursor.add(period * -1, 'hour');
    const idx = tick.hour() / CrawlDuration + 1;
    ids.push({
      period,
      crawl_id: +`${tick.format('YYYYMMDD')}${idx > 9 ? idx : '0' + idx}`,
      from_time: tick.add(-50, 'minute').unix(),
      to_time: tick.add(50, 'minute').unix(),
    });
  });

  return ids;
}
