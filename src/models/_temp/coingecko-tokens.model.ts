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

const db = 'wikiblock';
const name = 'coingecko-assets';
const model = mongoose.connection.useDb(db).model(name, schema, name);

export default model;
