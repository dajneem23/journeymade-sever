import config from '@/config';
import { IAccount } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document } from 'mongoose';

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
      type: String,
    },
    chains: {
      type: String,
    },
    tags: {
      type: String,
    },
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
  },
  {
    background: true,
  },
);

schema.index(
  {
    tags: 'text',
  },
  {
    background: true,
  },
);

const name = getModelName('accounts');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IAccount & Document>(name, schema, name);
