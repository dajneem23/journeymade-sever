import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';

import cors from 'cors';

import { logs } from './vars';
import { getResults } from '@/modules/debank/services/getResults';
import { groupBy } from '@/core/utils';

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
  const { limit = 500, offset = 0, type = null,  show_address = false } = req.query || {};

  if (limit > 500) {
    return res.status(400).send('Invalid query');
  }

  const rows = await getResults(limit, offset);
  let result = rows.map((row: any) => {
    const { symbol, crawl_id,  count, addresses } = row._doc;
    return {
      ...row._doc,
      addresses: show_address === false ? 'hidden' : addresses,
      _key: `${symbol}-${crawl_id}`
    }
  })

  if (type === 'bullish') {
    result = result.filter(item => item.percentage_change > 0);
  } else if (type === 'bearish') {
    result = result.filter(item => item.percentage_change < 0);
  }

  const groups = groupBy(result, '_key')

  res.send(groups);
})

app.get('/onchain', async function (req, res) {
  res.send('Hello 1fox: onchain');
})

export default app;
