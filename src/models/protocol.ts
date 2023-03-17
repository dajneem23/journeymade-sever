import config from '@/config';
import { IProtocol } from '@/interfaces';
import { getModelName } from '@/utils';
import mongoose, { Document, Schema } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new Schema<IProtocol>(
  {
    chain: {
      // "Ethereum"
      type: String,
      required: true,
    },
    dao_id: {
      // null
      type: String,
    },
    has_supported_portfolio: {
      // false
      type: Boolean,
      required: true,
      default: false,
    },
    id: {
      type: String,
      required: true,
    },
    is_tvl: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_visible_in_defi: {
      type: Boolean,
    },
    logo_url: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    platform_token_chain: {
      // "Ethereum"
      type: String,
      required: true,
    },
    platform_token_id: {
      // "0x6b175474e89094c44da98b954eedeac495271d0f"
      type: String,
      required: true,
    },
    platform_token_logo: {
      type: String,
    },
    platform_token_symbol: {
      type: String,
    },
    site_url: {
      type: String,
    },
    stats: {
      type: Schema.Types.Mixed,
    },
    tag_ids: {
      type: [String],
      required: true,
      default: [],
    },
    tvl: {
      type: Number,
    },
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
    id: 1,
  },
  {
    unique: true,
    background: true,
  },
);

const name = getModelName('protocols');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IProtocol & Document>(name, schema, name);
