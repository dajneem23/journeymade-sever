import dayjs from 'dayjs';
import fs from 'fs';

export const writeJsonFile = (filename, data) => {
  fs.writeFile(
    `logs/${filename}-${dayjs(new Date()).format('HH:m:ss')}.json`,
    JSON.stringify(data),
    function (err) {
      if (err) throw err;
    },
  );
};
