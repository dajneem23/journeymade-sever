import expressLoader from './express';
import mongooseLoader from './mongoose';
import pgLoader from './postgres';
import logger from './logger';
import ioRedis from './ioredis';
import dependencyInjectorLoader from './dependencyInjector';

const path = require('path');
const fs = require('fs');
// const modelFolder = 'models/';
const modelFolder = path.join(__dirname, '../models');

export default async ({ expressApp }) => {
  // await ioRedis();

  // await mongooseLoader();

  // await pgLoader();

  // TODO
  const injectModels = [];

  injectModels.length &&
    (await dependencyInjectorLoader({
      models: injectModels.map((m) => ({
        name: `${m}Model`,
        model: require(`../models/${m}`).default,
      })),
    }));
  logger.info('✌️ Dependency Injector loaded');

  await expressLoader({ app: expressApp });
  logger.info('✌️ Express loaded');
};
