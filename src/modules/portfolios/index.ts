import { nodeEnv } from '@/configs/vars';
import { initDebankBalancesJobs } from './debankBalances';
import { initDebankProjectsJobs } from './debankProjects';

export default async () => {
  console.log('🚀 ~ nodeEnv', nodeEnv);

  initDebankBalancesJobs();

  initDebankProjectsJobs();
};
