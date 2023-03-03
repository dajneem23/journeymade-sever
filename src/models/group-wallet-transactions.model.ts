import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    gw_id: String,  // group wallet id
    token: String,

    amount: Number, // total amount
    min_price: Number, //
    max_price: Number, //

    from_time: Number,
    to_time: Number,

    type: String, // deposit, withdraw
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
    gw_id: 1,
    from_time: -1,
    to_time: -1
  },
  {
    unique: true,
    background: true,
  },
);

schema.index(
  {
    token: 1,
    from_time: -1,
    to_time: -1
  },
  {
    background: true,
  },
);

schema.index(
  {
    token: 1,
    amount: -1,
    from_time: -1,
    to_time: -1
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `group-wallet-transactions${nodeEnv !== 'production' ? '-dev' : ''}`;
const model = mongoose.connection.useDb(db).model(name, schema);

export default model;
