import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: {
      type: String,
    },    
    symbol: {
      type: String,
    },
    cid: {
      type: Number,
    },  
    creator: {
      type: String,
    },
    address_count: {
      type: Number,
    },
    statistics: {
      type: [
        {
          type: Schema.Types.Mixed,
        },
      ],
    },
    wallets: {
      type: [
        {
          type: Schema.Types.Mixed,
        },
      ],
    },
    updated_at: {
      type: Schema.Types.Date,
      default: Date.now,
    }
  },
  {
    versionKey: false,
  },
);

schema.index(
  {
    id: 1
  },
  {
    background: true,
  },
);

schema.index(
  {
    symbol: 1,
    cid: -1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    cid: -1,
  },
  {
    background: true,
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

const name = `top-holders-statistics${nodeEnv === 'development' ? '-dev' : ''}`;
const model  = mongoose.connection
.useDb('onchain')
.model(name, schema, name);

export default model;
