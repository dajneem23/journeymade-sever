import expressLoader from './express';
import mongooseLoader from './mongoose';
import pgLoader from './postgres';
import logger from './logger';
import ioRedis from './ioredis';
import dependencyInjectorLoader from './dependencyInjector';
import workerLoader from './worker';
import crons from '@/crons';

const path = require('path');
const fs = require('fs');
// const modelFolder = 'models/';
const modelFolder = path.join(__dirname, '../models');

export default async ({ expressApp }) => {
  await ioRedis();

  await mongooseLoader();

  await workerLoader();

  // await pgLoader();

  logger.info('✌️ DB loaded and connected!');

  // TODO
  const injectModels = [
    'account',
    'token',
    'price',
    'tag',
    'transaction',
    'group',
    'groupFootprint',
    'transactionEvent',
    'debankTopHolders',
    'coinMarket',
    'accountSnapshot',
    'volume',
    'block',
    'rawTx'
  ];
  // const injectModels = fs.readdirSync(modelFolder).map(file => file.replace('.ts', ''))
  // || ['account', 'token', 'price', 'tag', 'transaction', 'group', 'groupFootprint', 'transactionEvent', 'debankTopHolders', 'coinMarket'];
  await dependencyInjectorLoader({
    models: injectModels.map((m) => ({
      name: `${m}Model`,
      model: require(`../models/${m}`).default,
    })),
  });
  logger.info('✌️ Dependency Injector loaded');

  await crons();

  await expressLoader({ app: expressApp });
  logger.info('✌️ Express loaded');
};
