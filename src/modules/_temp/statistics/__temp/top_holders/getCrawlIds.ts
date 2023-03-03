import cronLog from '@/modules/_temp/cron_logs';

const getCrawlIds = async () => {
  const rawLogs = await cronLog.get();
  const ids = Array.from(new Set(rawLogs.map((l) => l.crawl_id)));
  const ranges = [];
  for (let i = 0; i < ids.length; i++) {
    ids[i + 1] &&
      ranges.push({
        current: ids[i],
        previous: ids[i + 1],
      });
  }
  return ranges;
};

export default getCrawlIds;
