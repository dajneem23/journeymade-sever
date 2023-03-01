import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {  
  },
  {
    versionKey: false,
    strict: false
  },
);

const db = 'onchain';
const name = 'worker-tokens';
const model = mongoose.connection.useDb(db).model(name, schema, name);

export default model;
