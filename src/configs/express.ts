import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';

import cors from 'cors';

import { logs } from './vars';
import { getResults } from '@/modules/debank/services/getResults';

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
  const { limit = 100, offset = 0 } = req.query || {};

  if (limit > 100) {
    return res.status(400).send('Invalid query');
  }

  const result = await getResults(limit, offset);

  res.send(JSON.stringify(result));
})

app.get('/onchain', async function (req, res) {
  res.send('Hello 1fox: onchain');
})

export default app;
