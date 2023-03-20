import config from '@/config';
import { ITransaction } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */

const schema = new mongoose.Schema(
  {
    hash: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    }
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

schema.index(
  {
    hash: 1
  },
  {
    background: true,
  },
);

schema.index(
  {
    chain: 1,
    blockNumber: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    chain: 1,
    timestamp: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    to: 1
  },
  {
    background: true,
  },
);

const name = 'transaction';
export default mongoose.connection
  .useDb(config.mongoDbNames.onchain)
  .model<ITransaction & Document>(name, schema, name);
