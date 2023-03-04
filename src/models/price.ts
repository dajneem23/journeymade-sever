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
    time_at: {
      type: Number,
      required: true,
    },
    volume: Number,
    updated_at: String,
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
  },
);

schema.index(
  {
    symbol: 1,
    time_at: -1,
  },
  {
    background: true,
  },
);

const name = getModelName('prices');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IPrice & Document>(name, schema, name);
