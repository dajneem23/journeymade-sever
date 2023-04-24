import { setMaxListeners, EventEmitter } from 'node:events';
import 'reflect-metadata';
import express from 'express';
import config from './config';
import Logger from './loaders/logger';

require('events').defaultMaxListeners = 15;

const eventEmitter = new EventEmitter();
setMaxListeners(50, eventEmitter);

async function startServer() {
  const app = express();

  await require('./loaders').default({ expressApp: app });

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} ${config.nodeEnv} 🛡️
      ################################################
    `);
    })
    .on('error', (err) => {
      Logger.error(err);
      process.exit(1);
    });
}

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION!!! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION!!!  shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

startServer();
