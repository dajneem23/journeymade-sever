import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      index: true,
    },
    usd_value: {
      type: Number,
      index: true,
    },
  },
  {
    versionKey: false,
  },
);

const db = 'onchain';
const name = 'tokens';
const model = mongoose.connection.useDb(db).model(name, schema, name);

export default model;
