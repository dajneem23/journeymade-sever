import { nodeEnv } from '@/configs/vars';
import topHolders from './topHolders';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  topHolders.triggerCronJobs();

  if (nodeEnv === 'production') {
    topHolders.scheduleCronJobs();
  }
};
