// import balances from '@/modules/portfolios/debankBalances';
// import projects from '@/modules/portfolios/debankProjects';
import topHolders from '@/modules/_temp/statistics/__temp/top_holders/index';
import cronLog from '@/modules/_temp/cron_logs';
import express from 'express';

const router = express.Router();

const row = html => `<tr>\n${html}</tr>\n`,
      heading = object => row(Object.keys(object).reduce((html, heading) => (html + `<th>${heading}</th>`), '')),
      datarow = object => row(Object.values(object).reduce((html, value) => (html + `<td>${value}</td>`), ''));
                               
function htmlTable(dataList) {
  return `<table>
            ${heading(dataList[0])}
            ${dataList.reduce((html, object) => (html + datarow(object)), '')}
          </table>`
}

// middleware that is specific to this router
router.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});
// define the home page route
router.get('/', async (req, res) => {

  const rawLogs = await cronLog.get();

  const table = htmlTable(rawLogs.map(row => {
    return {
      id: row.crawl_id,
      name: row.job_name,
      count: row.job_count,
      completed: row.job_status.completed,
      failed: row.job_status.failed,
      link: `<a target="_blank" href="http://api.1fox.pro/cron/trigger?type=${row.job_name}&crawl_id=${row.crawl_id}" >trigger</a>`
    }
  }))

  res.send(table);
});

// define the about route
// router.get('/trigger', (req, res) => {
//   const { type = '', crawl_id } = req.query || {};

//   if (!type || !crawl_id) {
//     return res.status(400).send('Invalid query');
//   }

//   if (type.includes('balances')) {
//     balances.triggerCronJobs(crawl_id);
//   } else if (type.includes('projects')) {
//     projects.triggerCronJobs(crawl_id);
//   } else if (type.includes('holders')) {
//     topHolders.triggerCronJobs(crawl_id);
//   } else {
//     return res.status(400).send('Invalid type');
//   }

//   res.send(`Accept: ${type}-${crawl_id}`);
// });

export default router;
