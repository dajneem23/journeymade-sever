import app from './configs/express';
import logger from './configs/logger';
import mongoLoader from './configs/mongoose';
import pgLoader from './configs/postgres';
import { initTelegramBot } from './configs/telegram';
import { nodeEnv, port } from './configs/vars';

(async () => {
  try {
    await pgLoader();

    await mongoLoader();

    initTelegramBot();

    // if (env.MODE == 'production') {
    //   await (await import('./loaders/telegram.loader')).default();
    // }

    // // Caching (Redis)
    // await (await import('./loaders/redis.loader')).default();
    // (await import('./loaders/worker.loader')).default();
    // (await import('./modules/debank')).default();

    (await import('./modules/portfolios')).default();
    
    // (await import('./modules/statistics')).default();

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
