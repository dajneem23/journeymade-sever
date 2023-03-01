import { nodeEnv } from '@/configs/vars';
import { scheduleCronJobs, triggerCronJobs } from './top_holders';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  triggerCronJobs();

  if (nodeEnv === 'production') {
    scheduleCronJobs();
  }
};
