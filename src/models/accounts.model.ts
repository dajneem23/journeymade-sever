import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    tokens: {
      type: [String],
      default: []
    },
    chains: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
    versionKey: false,
  },
);

schema.index(
  {
    address: 1,
  },
  {
    unique: true,
    background: true,
  },
);

schema.index(
  {
    tokens: 1,
    tags: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `accounts${nodeEnv !== 'production' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb(db)
.model(name, schema);

export default model;
