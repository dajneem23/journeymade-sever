import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    name: String,
    contract_ids: Object  // { ethereum: "0x514910771af9ca656af840dff83e8264ecf986ca" }
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      updatedAt: false,
      createdAt: false,
    },
    versionKey: false,
  },
);

schema.index(
  {
    symbol: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    contract_ids: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain-analysis';
const name = `tokens${nodeEnv !== 'production' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb(db)
.model(name, schema);

export default model;
