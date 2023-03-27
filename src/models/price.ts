import config from '@/config';
import { IPrice } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
    id: String, // coingecko id
    volume: Number,
    updated_at: String,
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    strict: false,
    versionKey: false,
  },
);

schema.index(
  {
    symbol: 1,
    timestamp: -1,
  },
  {
    background: true,
  },
);

const name = 'token-price'
// TODO
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchain)
  .model<IPrice & Document>(name, schema, name);
