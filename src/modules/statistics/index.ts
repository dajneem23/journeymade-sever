import { nodeEnv } from '@/configs/vars';
import topHolders from './top_holders';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  topHolders.triggerCronJobs();

  if (nodeEnv === 'production') {
    topHolders.scheduleCronJobs();
  }
};
