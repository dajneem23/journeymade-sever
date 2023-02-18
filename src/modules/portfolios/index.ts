import { nodeEnv } from '@/configs/vars';
import balances from './debankBalances';
import projects from './debankProjects';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  if (nodeEnv !== 'production') {
    balances.triggerCronJobs();
    projects.triggerCronJobs();
  } else {
    balances.scheduleCronJobs();
    projects.scheduleCronJobs();
  }
};
