import config from '@/config';
import { IToken } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: String,
    symbol: String,
    name: String,
    address: String,
    decimals: Number,
    chainId: Number,
    logoURI: String,
    coingeckoId: String,
    listedIn: [String],
    enabled: Boolean,
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
    chainId: 1,
    enabled: 1,
  },
  {
    background: true,
  },
);

const name = 'token';
// TODO
export default mongoose.connection
  .useDb('onchain' || config.mongoDbNames.onchain)
  .model<IToken & Document>(name, schema, name);
