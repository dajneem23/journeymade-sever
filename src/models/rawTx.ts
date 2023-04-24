import config from '@/config';
import mongoose from 'mongoose';
/**
 * raw-tx collection
 * @private
 */
const eventSchema = new mongoose.Schema(
  {
    type: String,
    name: String,
    value: String,
  },
  {
    _id: false,
  },
);
const logSchema = new mongoose.Schema(
  {
    log_index: Number,
    action: String,
    address: String,
    events: [eventSchema],
  },
  {
    _id: false,
  },
);
const schema = new mongoose.Schema(
  {
    tx_hash: {
      type: String,
    },
    block_number: {
      type: Number,
    },
    address: {
      type: String,
    },
    chain: {
      type: String,
    },
    chain_id: {
      type: Number,
    },
    logs: [logSchema],
    processed_on: {
      type: Number
    }
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
    strict: false,
  },
);

// TODO: 
const db = 'onchain' || config.mongoDbNames.onchain;
const name = 'raw-tx';
const model = mongoose.connection.useDb(db).model(name, schema, name);

export default model;