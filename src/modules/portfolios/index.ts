import { nodeEnv } from '@/configs/vars';
import balances from './debankBalances';
import projects from './debankProjects';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);
  
  balances.triggerCronJobs();
  projects.triggerCronJobs();

  if (nodeEnv === 'production') {
    balances.scheduleCronJobs();
    projects.scheduleCronJobs();
  } 
};
