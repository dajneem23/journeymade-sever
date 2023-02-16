import mongoose from 'mongoose';
import logger from './logger';
import { mongo, nodeEnv } from './vars';

// set mongoose Promise to Bluebird
mongoose.Promise = Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
  // process.exit(-1);
});

mongoose.connection.on('reconnected', () => {
  logger.error(`MongoDB reconnected: ${new Date()}`);
});

// // print mongoose logs in dev env
// if (nodeEnv === 'development') {
//   mongoose.set('debug', true);
// }

mongoose.set('strictQuery', false);

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const mongoLoader = async () => {
  await new Promise((resolve) => {
    mongoose
    .connect(mongo.uri, {
      maxPoolSize: 100,
      keepAlive: true,
      socketTimeoutMS: 90000,
      serverSelectionTimeoutMS: 90000,
      waitQueueTimeoutMS: 300000
    })
    .then(() => {
      console.log('MongoDB connected!')
      resolve(true);
    });
  })
  
  return mongoose.connection;
};

export default mongoLoader;
