import expressLoader from './express';
import mongooseLoader from './mongoose';
import pgLoader from './postgres';
import logger from './logger';
import ioRedis from './ioredis';
import initTelegramBot from './telegram';
import dependencyInjectorLoader from './dependencyInjector';

const path = require('path');
const fs = require('fs');
// const modelFolder = 'models/';
const modelFolder = path.join(__dirname, '../models');
console.log("🚀 ~ file: index.ts:13 ~ modelFolder:", modelFolder)

export default async ({ expressApp }) => {
  await mongooseLoader();

  // await pgLoader();

  // await ioRedis();

  logger.info('✌️ DB loaded and connected!');

  // initTelegramBot();

  // TODO
  // const injectModels = ['account', 'token', 'price', 'tag', 'transaction', 'group', 'groupFootprint', 'transactionEvent', 'debankTopHolders']
  const injectModels = fs.readdirSync(modelFolder).map(file => file.replace('.ts', ''));
  await dependencyInjectorLoader({
    models: injectModels.map(m => ({
      name: `${m}Model`,
      model: require(`../models/${m}`).default,
    }))
  });
  logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  logger.info('✌️ Express loaded');
};
