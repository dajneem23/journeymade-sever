import config from '@/config';
import { IAccountSnapshot } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    address: {
      type: String,
    },
    balance_list: {
      type: mongoose.Schema.Types.Mixed,
    },
    project_list: {
      type: mongoose.Schema.Types.Mixed,
    },
    stats: {
      type: mongoose.Schema.Types.Mixed,
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

// TODO
const name = 'account-snapshot';
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchain)
  .model<IAccountSnapshot & Document>(name, schema, name);
