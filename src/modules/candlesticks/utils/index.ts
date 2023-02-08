import dayjs from 'dayjs';

export const generateID = ({ symbol, time_stamp, time_frame }) => {
  const date = dayjs.unix(time_stamp / 1000).format('YYMMDD_HHmmss');

  return `${time_frame}-${date}-${symbol}`;
};

export const sumByFieldOfArray = (array, field) => {
  return array.reduce((accumulator, object) => {
    return accumulator + (typeof object[field] == 'number' ? object[field] : 0);
  }, 0);
};

