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

// TODO
const name = 'tx-event';
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchain)
  .model<ITransactionEvent & Document>(name, schema, name);