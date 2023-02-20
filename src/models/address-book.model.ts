import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    address: {
      type: String,
    },
    labels: [{
      type: String,
    }],
    tags: [{
      type: String,
    }],
    tokens: [{
      type: String,
    }],
    updated_at: {
      type: Date,
      default: Date.now,
    }
  },
  {
    versionKey: false,
  },
);

schema.index(
  {
    address: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    tags: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain';
const name = 'address-book';
const model  = mongoose.connection
.useDb(db)
.model(name, schema, name);

export default model;
