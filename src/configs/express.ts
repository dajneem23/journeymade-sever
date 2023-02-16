import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';

import cors from 'cors';

import { logs } from './vars';
import { getResults } from '@/modules/debank/services/getResults';
import { groupBy } from '@/core/utils';
import { triggerCronJob as triggerBalanceCronJob } from '@/modules/portfolios/debankBalances';
import { triggerCronJob as triggerProjectCronJob } from '@/modules/portfolios/debankProjects';

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

app.get('/onchain/top-holders-segments', async function (req, res) {
  const {
    limit = 100,
    offset = 0,
    type = null,
    symbol,
    show_holders = false,
    min_pc = 5,
    max_pc = 10000,
  } = req.query || {};

  if (limit > 500) {
    return res.status(400).send('Invalid query');
  }

  const rows = await getResults({
    symbol,
    limit,
    offset,
    min_pc,
    max_pc,
  });
  let result = rows.map((row: any) => {
    const { symbol, crawl_id, holders } = row;
    return {
      ...row,
      holders: show_holders === false ? 'hidden' : holders,
      _key: `${symbol}-${crawl_id}`,
    };
  });

  if (type === 'bullish') {
    result = result.filter((item) => item.percentage_change > 0);
  } else if (type === 'bearish') {
    result = result.filter((item) => item.percentage_change < 0);
  }

  const groups = groupBy(result, '_key');

  res.send(groups);
});

app.get('/cron', async function (req, res) {
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

app.get('/onchain', async function (req, res) {
  res.send('Hello 1fox: onchain');
});

export default app;
