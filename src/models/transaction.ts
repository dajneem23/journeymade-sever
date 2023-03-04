import config from '@/config';
import { ITransaction } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document, Schema } from 'mongoose';

/**
 * schema
 * @private
 */

const schema = new mongoose.Schema(
  {
    id: {
      // tx_id
      type: String,
      trim: true,
      required: true,
    },
    chain: {
      type: String,
      trim: true,
      required: true,
    },

    tokens: String,

    sends: [Schema.Types.Mixed],
    receives: [Schema.Types.Mixed],

    time_at: Number,
    tx: Schema.Types.Mixed,

    updated_at: Number,
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
    id: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    time_at: -1,        
    tx: 1,
  },
  {
    background: true,
  },
);

const name = getModelName('transactions');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<ITransaction & Document>(name, schema, name);
