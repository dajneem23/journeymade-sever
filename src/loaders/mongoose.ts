import mongoose from 'mongoose';
import logger from './logger';
import config from '@/config';
import recachegoose from 'recachegoose'
import { ioRedisToken } from './ioredis';
import Container from 'typedi';

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

mongoose.connection.on('reconnected', () => {
  logger.warn(`MongoDB reconnected: ${new Date()}`);
});

// print mongoose logs in dev env
if (config.nodeEnv === 'development') {
  // mongoose.set('debug', true);
}

mongoose.set('strictQuery', false);

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const mongoLoader = async () => {
  const ioredis = Container.get(ioRedisToken);

  recachegoose(mongoose, {
    engine: 'redis',
    client: ioredis 
  });
  
  await new Promise((resolve) => {    
    mongoose
      .connect(config.mongoDbURI, {
        maxPoolSize: 200,
        keepAlive: true,
        socketTimeoutMS: 90000,
        serverSelectionTimeoutMS: 90000,
        waitQueueTimeoutMS: 90000,
      })
      .then(() => {
        logger.info('MongoDB connected!');
        resolve(true);
      });
  });

  return mongoose.connection;
};

export default mongoLoader;
