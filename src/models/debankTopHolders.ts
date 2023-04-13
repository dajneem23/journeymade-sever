import config from '@/config';
import { IDebankTopHolders } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: String,
    addresses: [String],
    holders: Number,
    stats: {
      amount: Number,
      usd_value: Number,
      tags: Object,
    },
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
    strict: false,
  },
);

const name = 'debank-top-holders';
// TODO
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchain)
  .model<IDebankTopHolders & Document>(name, schema, name);
