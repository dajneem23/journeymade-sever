import { nodeEnv } from '@/configs/vars';
import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    symbol: {
      type: String,
    },
    crawl_id: {
      type: Number,
    },
    id: {
      type: String,
    },
    from_time: {
      type: Number,
    },
    to_time: {
      type: Number,
    },
    count: {
      type: Number,
    },
    min_price: {
      type: Number,
    },
    max_price: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    percentage_change: {
      type: Number
    },
    abs_percentage_change: {
      type: Number
    },

    usd_value: {
      type: Number,
    },
    usd_change: {
      type: Number,
    },
    usd_percentage_change: {
      type: Number,
    },
    abs_usd_percentage_change: {
      type: Number,
    },
    holders: {
      type: [
        {
          type: Schema.Types.Mixed,
        },
      ],
    },
    hot_wallets: {
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
    symbol: 1,
    crawl_id: -1,
    id: 1
  },
  {
    background: true,
  },
);

schema.index(
  {
    symbol: 1,
    crawl_id: -1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    crawl_id: -1,
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
