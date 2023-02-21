import app from './configs/express';
import ioRedis from './configs/ioredis';
import logger from './configs/logger';
import mongoLoader from './configs/mongoose';
import pgLoader from './configs/postgres';
import { initTelegramBot } from './configs/telegram';
import { nodeEnv, port } from './configs/vars';

(async () => {
  try {
    await pgLoader();

    await mongoLoader();
    
    await ioRedis();

    initTelegramBot();

    (await import('./modules/wallet_book')).default();

    (await import('./modules/portfolios')).default();

    (await import('./modules/statistics')).default();

    // listen to requests
    app.listen(port, () =>
      logger.info(`server started on port ${port} (${nodeEnv})`),
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

/**
 * Exports express
 * @public
 */
export default app;
