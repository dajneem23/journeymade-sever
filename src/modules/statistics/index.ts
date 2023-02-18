import { nodeEnv } from '@/configs/vars';
import { groupBy } from '@/core/utils';
import cronLog from '@/modules/cron_logs'

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  const rawLogs = await cronLog.get();
  const cronLogs = groupBy(rawLogs, 'crawl_id');
  console.log("🚀 ~ file: index.ts:8 ~ logs", cronLogs)

  // const crawlId = 
  // Object.keys(cronLogs).forEach(id => {

  // })
};
