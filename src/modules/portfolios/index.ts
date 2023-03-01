import { nodeEnv } from '@/configs/vars';
import BalancesAdapter from './balancesAdapter';
import ProjectsAdapter from './projectsAdapter';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  const balances = new BalancesAdapter();
  const projects = new ProjectsAdapter();

  balances.triggerCronJobs();
  projects.triggerCronJobs();
  
  if (nodeEnv === 'production') {
    balances.scheduleCronJobs();
    projects.scheduleCronJobs();
  } 
};
