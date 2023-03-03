import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    address: String,
    ref_id: String, // raw data id
    cid: Number, // crawl_id, indexed

    symbol: String,
    amount: Number,
    price: Number,
    usd_value: Number,
    chain: String,

    dao_id: String,
    pool_id: String,
    pool_adp_id: String, // pool_adapter_id
    pf_token_id: String, // platform_token_id

    ctime: Number, // crawl_time
    updated_at: Number,
    created_at: Number,
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
    versionKey: false,
  },
);

schema.index(
  {
    address: 1,
    ref_id: 1
  },
  {
    background: true,
  },
);

schema.index(
  {
    address: 1,
    symbol: 1,
    cid: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    address: 1,
    symbol: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `account-portfolios${nodeEnv !== 'production' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb(db)
.model(name, schema, name);

export default model;
