import config from '@/config';
import { ITokenVolume } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    token_address: String,
    from_time: Number,
    to_time: Number,

    chain_id: Number,
    token_id: String,
    token_symbol: String,

    count: Number,
    amount: Number,
    usd_value: Number,
    price: Number,
    change_percentage: Number,

    buy: {
      type: mongoose.Schema.Types.Mixed
    },
    sell: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
    versionKey: false,
    strict: false
  },
);

schema.index(
  {    
    from_time: -1,
    to_time: -1,
    token_address: 1,
  },
  {
    background: true,
    unique: true,
  },
);

const name = 'volume'
export default mongoose.connection
  .useDb(config.mongoDbNames.onchainApp)
  .model<ITokenVolume & Document>(name, schema, name);
