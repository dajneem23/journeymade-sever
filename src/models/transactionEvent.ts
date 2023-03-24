import config from '@/config';
import mongoose, { Document, Schema } from 'mongoose';
import { ITransactionEvent } from '../interfaces/ITransactionEvent';

/**
 */
const schema = new Schema(
  {
    tx_hash: {
      type: String,
    },
    log_index: {
      type: Number,
    },
    type: {
      type: String,
    },

    block_number: {
      type: Number,
    },
    timestamp: {
      type: Number,
    },

    token: {
      type: String,
    },
    symbol: {
      type: String,
    },

    account: {
      type: String,
    },
    account_type: {
      type: String,
    },
    ref_account: {
      type: String,
    },

    amount: {
      type: Number,
    },
    usd_value: {
      type: Number,
    },
    price: {
      type: Number,
    },

    chain: {
      type: String,
    },
    chain_id: {
      type: Number,
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
    tx_hash: 1
  },
  {
    background: true,
  },
);

schema.index(
  {
    symbol: 1,
    timestamp: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    chain_id: 1,
    timestamp: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    usd_value: -1,
    timestamp: -1
  },
  {
    background: true,
  },
);

const name = 'tx-event';
export default mongoose.connection
  .useDb(config.mongo.dbName)
  .model<ITransactionEvent & Document>(name, schema, name);
