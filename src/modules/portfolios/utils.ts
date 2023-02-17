import dayjs from 'dayjs';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export const cleanAmount = (amount) => {
  return parseFloat(Number(amount).toFixed(3));
};

export const cleanPrice = (price) => {
  return parseFloat(Number(price).toFixed(3));
};

export const prepareCrawlIds = () => {
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

  for (let i = (24 / duration) - 1; i > 0; i--) {
    ids.push({
      crawl_id: `${yesterday}${i < 10 ? '0' + i : i}`,
    });
  }

  return ids.slice(0, 6);
};

export const prepareOffsets = (max, limit) => {
  const offsets = [];
  for (let i = 0; i < Math.round(Number(max) / limit) * limit; i += limit) {
    offsets.push(i);
  }
  return offsets;
};

export const toTimestamp = (val) => {
  return dayjs(val).unix();
};

export const crawlIdAlias = (id) => {
  return Number(`${id}`.substring(4, 10));
};

export const getJobId = ({ crawl_id, offset, limit }) => {
  return `${crawl_id}:${offset}-${limit}`;
};
