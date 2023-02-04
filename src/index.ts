import { port, nodeEnv } from './configs/vars.js';
import logger from './configs/logger.js';
import mongoose from './configs/mongoose.js';
import app from './configs/express.js';
import { initPriceData, watchChangeData } from './candlesticks/index.js';
import { addRows, initGoogleSpreadsheetService } from './google_spreadsheet/index.js';

// const { port, nodeEnv } = vars;
// open mongoose connection

try {
  await initGoogleSpreadsheetService();
} catch (error) {
  console.log('🚀 ~ initGoogleSpreadsheetService ~ error', error);
}

mongoose.connect(async () => {
  try {
    await initPriceData();
    
    watchChangeData();
  } catch (error) {
    console.log('🚀 ~ file: index.js:14 ~ mongoose.connect ~ error', error);
  }
});


// listen to requests
app.listen(port, () =>
  logger.info(`server started on port ${port} (${nodeEnv})`),
);

/**
 * Exports express
 * @public
 */
export default app;
