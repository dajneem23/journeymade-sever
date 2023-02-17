import dayjs from 'dayjs';

export const cleanAmount = (amount) => {
  return parseFloat(Number(amount).toFixed(3));
};

export const cleanPrice = (price) => {
  return parseFloat(Number(price).toFixed(3));
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

export const getJobId = ({
  crawl_id,
  offset,
  limit
}) => {
  return `${crawl_id}:${offset}-${limit}`
}

