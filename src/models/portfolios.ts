import config from '@/config';
import { IPortfolio } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document } from 'mongoose';

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
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
    versionKey: false,
  },
);

schema.index(
  {
    address: 1,
    ref_id: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    address: 1,
    symbol: 1,
    cid: -1,
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

const name = getModelName('portfolios');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IPortfolio & Document>(name, schema, name);
