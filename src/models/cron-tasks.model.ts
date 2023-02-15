import mongoose, { Schema } from 'mongoose';

/**
 * Top Holders Signals Schema
 * @private
 */
const cronTasksSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      index: true
    },
    crawl_id: {
      type: String,
    },
    count: {
      type: Number,
    },    
    from_crawl_time: {
      type: Date,
    },
    to_crawl_time: {
      type: Date,
    },    
    status: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
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

const db = 'onchain';
const name = 'cron-tasks';
const model = mongoose.connection
  .useDb(db)
  .model(name, cronTasksSchema, name);

export default model;
