import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */

const schema = new mongoose.Schema(
  {
    id: { // tx_id
      type: String,
      trim: true,
      required: true,
    }, 
    chain: {
      type: String,
      trim: true,
      required: true,
    },
    sends: [
      new mongoose.Schema({
        amount: Number,
        to_addr: String,
        price: Number,
        token_id: String,
        token_symbol: String,
      }),
    ],
    receives: [
      new mongoose.Schema({
        amount: Number,
        from_addr: String,
        price: Number,
        token_id: String,
        token_symbol: String,
      }),
    ],
    
    time_at: Number,
    tx: Schema.Types.Mixed,

    updated_at: Number,
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
  },
);

schema.index(
  {
    id: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    time_at: -1,
    sends: 1,
    receives: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `account-transactions${nodeEnv !== 'production' ? '-dev' : ''}`;
const model = mongoose.connection.useDb(db).model(name, schema, name);

export default model;
