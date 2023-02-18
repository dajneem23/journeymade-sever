import balances from '@/modules/portfolios/debankBalances';
import projects from '@/modules/portfolios/debankProjects';
import express from 'express';

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
    balances.triggerCronJobs(crawl_id);
  } else if (type === 'project') {
    projects.triggerCronJobs(crawl_id);
  }

  res.send(`Accept: ${type}-${crawl_id}`);
});

export default router;
