import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: String,
    description: String,
    source: String,
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
    id: 1,
  },
  {
    unique: true,
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `tags${nodeEnv !== 'production' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb(db)
.model(name, schema);

export default model;
