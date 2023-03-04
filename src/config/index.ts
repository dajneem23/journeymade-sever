import dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// config() will read your .env file, parse the contents, assign it to process.env.
dotenv.config();

(() => {
  let envConfig: { [key: string]: string };
  if (process.env.ENV_VARS) {
    // Load config variables from CI/CD server
    envConfig = JSON.parse(process.env.ENV_VARS);
  }

  if (typeof envConfig === 'object') {
    Object.keys(envConfig).forEach(
      (key) => (process.env[key] = envConfig[key]),
    );
  }
})();

export default {
  nodeEnv: process.env.NODE_ENV,

  port: parseInt(process.env.PORT, 10),

  mongoDbURI: process.env.INTERNAL_MONGO_URI || process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME,

  api: {
    prefix: '/api',
    version: 'v1',
  },

  /**
   * Your secret sauce
   */
  jwtSecret: process.env.JWT_SECRET,
  jwtAlgorithm: process.env.JWT_ALGO,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,

  /**
   * Used by winston logger
   */
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },

  postgres: {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  },

  redis: {
    port: +process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  }
};
