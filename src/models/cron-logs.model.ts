import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    job_name: {
      type: String,
    },
    crawl_id: {
      type: Number,
    },
    data: {
      raw_count: {
        type: Number,
      },
      result_count: {
        type: Number,
      },  
    },
    job_count: {
      type: Number,
    },
    job_status: {
      completed: {
        type: Number,
      },
      failed: {
        type: Number,
      },
      wait: {
        type: Number,
      },
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

schema.index(
  {
    crawl_id: 1,
  },
  {
    background: true,
  },
);

const db = 'onchain';
const name = 'cron-logs';
const model = mongoose.connection
  .useDb(db)
  .model(name, schema, name);

export default model;
