import path from 'path';
import env from 'dotenv-safe';

// import .env variables
env.config({
  path: path.join(__dirname, '/../../.env'),
  allowEmptyValues: true,
});

export const nodeEnv = process.env.NODE_ENV;
export const port = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpirationInterval = process.env.JWT_EXPIRATION_MINUTES;
export const mongo = {
  uri:
    process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TESTS
      : process.env.MONGO_URI,
  rawCollections: [
    'candlesticks_abc_1m',
    'candlesticks_def_1m',
    'candlesticks_jkl_1m',
    'candlesticks_mno_1m',
    'candlesticks_stu_1m',
    'candlesticks_vwx_1m',
  ],
};
export const logs = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

/**
 * Time frame options in minutes
 */
export const timeFrameOptions = {
  '1min': 1,
  '2mins': 2,
  '3mins': 3,
  '5mins': 5,
  '15mins': 15,
  '1h': 60,
  '4h': 240,
  '12h': 720,
  '24h': 1440,
};

export const candlestickCount = 300;
export const symbolFilters = [];
export const chartTimeFrames = [
  timeFrameOptions['1min'],
  // timeFrameOptions['2mins'],
  // timeFrameOptions['3mins'],
  timeFrameOptions['5mins'],
  timeFrameOptions['15mins'],
  timeFrameOptions['1h'],
  timeFrameOptions['4h'],
];
