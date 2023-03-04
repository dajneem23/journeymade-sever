import config from '@/config';
import { IToken } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document } from 'mongoose';

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
    contract_ids: Object, // { ethereum: "0x514910771af9ca656af840dff83e8264ecf986ca" }
    updated_at: String,
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
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

const name = getModelName('tokens');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IToken & Document>(name, schema, name);
