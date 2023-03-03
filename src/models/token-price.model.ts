import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

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
    volume: Number
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: false,
      createdAt: 'created_at',
    },
    versionKey: false,
  },
);

schema.index(
  {
    symbol: 1,
    time_at: -1
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `token-price${nodeEnv !== 'production' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb(db)
.model(name, schema);

export default model;
