import express from 'express';
import { triggerCronJob as triggerBalanceCronJob } from '@/modules/portfolios/debankBalances';
import { triggerCronJob as triggerProjectCronJob } from '@/modules/portfolios/debankProjects';

const router = express.Router();

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', (req, res) => {
  res.send('cron apis');
});
// define the about route
router.get('/trigger', (req, res) => {
  const { type, crawl_id } = req.query || {};

  if (!['balance', 'project'].includes(type) || !crawl_id) {
    return res.status(400).send('Invalid query');
  }

  if (type === 'balance') {
    triggerBalanceCronJob(crawl_id);
  } else if (type === 'project') {
    triggerProjectCronJob(crawl_id);
  }

  res.send(`Accept: ${type}-${crawl_id}`);
});

export default router;
