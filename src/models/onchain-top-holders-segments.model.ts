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
    updated_at: {
      type: Schema.Types.Date,
    },
    count: {
      type: Number,
    },
    crawl_id: {
      type: Number,
    },
    avg_balance: {
      type: Number,
    },
    addresses: {
      type: [
        {
          type: String,
        },
      ],
    },
    percentage_change: {
      type: Number
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
