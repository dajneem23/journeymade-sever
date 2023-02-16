import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const userSymbolPortfoliosSchema = new mongoose.Schema(
  {
    wallet_address: {
      type: String,
    },
    symbol: {
      type: String,
    },
    amount: {
      type: Number,
    },
    price: {
      type: Number,
    },
    chain: {
      type: String,
    },
    usd_value: {
      type: Number,
    },
    dao_id: {
      type: String,

    },
    platform_token_id: {
      type: String,
    },
    pool_id: {
      type: String,
    },
    pool_adapter_id: {
      type: String,
    },
    crawl_id: {
      type: Number,
    },
    crawl_time: {
      type: Number,
    },
    source: {
      type: String,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    versionKey: false,
  },
);

const db = 'onchain';
const name = 'user-portfolios';
const model = mongoose.connection
  .useDb(db)
  .model(name, userSymbolPortfoliosSchema, name);

export default model;
