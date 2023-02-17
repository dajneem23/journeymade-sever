import path from 'path';
import env from 'dotenv-safe';

// import .env variables
env.config({
  path: path.join(__dirname, '/../../.env'),
  allowEmptyValues: true,
});

/**
 * Loads ENV config
 */
(() => {
  let envConfig: { [key: string]: string };
  if (process.env.ENV_VARS) {
    // Load config variables from CI/CD server
    envConfig = JSON.parse(process.env.ENV_VARS);
  } 
  
  if (typeof envConfig === 'object') {
    Object.keys(envConfig).forEach((key) => (process.env[key] = envConfig[key]));
  }
})();

export const nodeEnv = process.env.NODE_ENV;
export const port = process.env.PORT;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpirationInterval = process.env.JWT_EXPIRATION_MINUTES;
export const mongo = {
  uri: process.env.INTERNAL_MONGO_URI
      || process.env.MONGO_URI,
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
export const postgresConfig = {
  host: process.env.POSTGRESQL_HOST,
  port: process.env.POSTGRESQL_PORT,
  user: process.env.POSTGRESQL_USERNAME,
  password: process.env.POSTGRESQL_PASSWORD,
  database: process.env.POSTGRESQL_DATABASE
}

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
  timeFrameOptions['5mins'],
  timeFrameOptions['15mins'],
  timeFrameOptions['1h'],
  timeFrameOptions['4h'],
];


export const minUSDValue = 1000;
