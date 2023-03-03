import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export const generateJobId = ({ names = [], offset, limit }) => {
  if (names && names.length > 0) return `${names.join(':')}:${offset}-${limit}`;

  return `${offset}-${limit}`;
};

function prepareCrawlIds(limit = 10) {
  const duration = 3; // 3 hours
  const now = dayjs().utc();

  const ids = [];
  const yesterday = now.add(-1, 'day').format('YYYYMMDD');
  const today = now.format('YYYYMMDD');
  const currentIndex = Math.ceil(now.hour() / duration);

  for (let j = currentIndex; j > 0; j--) {
    ids.push({
      crawl_id: `${today}${j < 10 ? '0' + j : j}`,
    });
  }

  for (let i = 24 / duration; i > 0; i--) {
    ids.push({
      crawl_id: `${yesterday}${i < 10 ? '0' + i : i}`,
    });
  }

  return ids.slice(0, limit);
}

function prepareOffsets(max, limit) {
  const offsets = [];
  for (let i = 0; i < Math.round(Number(max) / limit) * limit; i += limit) {
    offsets.push(i);
  }
  return offsets;
}

const defaultLimit = 200;
export const generateCronJobs = async ({
  countFunction,
  only_crawl_id = null,
  limit = defaultLimit
}) => {
  const ids = [];
  if (only_crawl_id) {
    ids.push({ crawl_id: +only_crawl_id });
  } else {
    ids.push(...prepareCrawlIds());
  }

  const jobs = await Promise.all(
    ids.slice(0, 1).map(async ({ crawl_id }) => {
      const count = await countFunction({ crawl_id });
      const offsets = prepareOffsets(count, limit);
      return {
        crawl_id,
        raw_count: count,
        jobs: offsets.map((offset) => ({
          crawl_id: Number(crawl_id),
          offset,
          limit,
        })),
      };
    }),
  );

  return jobs;
};
