import { port, nodeEnv } from './configs/vars';
import logger from './configs/logger';
import mongoose from './configs/mongoose';
import app from './configs/express';
import { initPriceData, watchChangeData } from './candlesticks/index';
import { addRows, initGoogleSpreadsheetService } from './google_spreadsheet/index';

// const { port, nodeEnv } = vars;
// open mongoose connection

// try {
//   await initGoogleSpreadsheetService();
// } catch (error) {
//   console.log('🚀 ~ initGoogleSpreadsheetService ~ error', error);
// }

mongoose.connect(async () => {
  try {
    await initGoogleSpreadsheetService();

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
