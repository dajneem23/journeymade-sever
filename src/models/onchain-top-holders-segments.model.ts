import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const topHoldersSegmentsSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      index: true,
    },
    segment_id: {
      type: String,
    },
    crawl_id: {
      type: Number,
    },
    count: {
      type: Number,
    },
    total_amount: {
      type: Number,
    },
    total_usd_value: {
      type: Number,
    },
    updated_at: {
      type: Schema.Types.Date,
    },
    crawl_time: {
      type: Schema.Types.Date,
    },
    holders: {
      type: [
        {
          type: Schema.Types.Mixed,
        },
      ],
    },
    percentage_change: {
      type: Number
    },
    hot_wallets: {
      type: Schema.Types.Mixed
    },
    newbie_wallets: {
      type: Schema.Types.Mixed
    }
  },
  {
    versionKey: false,
  },
);

const model  = mongoose.connection
.useDb('onchain')
.model('top-holders-segments', topHoldersSegmentsSchema, 'top-holders-segments');

export default model;
