import config from '@/config';
import { ICoinMarket } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: String,
    name: String,
    symbol: String,
    last_updated: String,
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
    strict: false
  },
);

const name = 'coin-market'
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchainApp)
  .model<ICoinMarket & Document>(name, schema, name);
