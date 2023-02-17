import bodyParser from 'body-parser';
import compress from 'compression';
import express from 'express';
import methodOverride from 'method-override';
import morgan from 'morgan';

import cors from 'cors';

import { logs } from './vars';

import cronAPI from '@/api/cron';
import onchainAPI from '@/api/onchain';
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

app.use('/onchain', onchainAPI);
app.use('/cron', cronAPI);

export default app;
