import httpStatus from 'http-status';
import mongoose, { Schema } from 'mongoose';
import { chartTimeFrames } from '../configs/vars.js';
import APIError from '../errors/api-error.js';

/**
 * Candlesticks Roles
 */
const roles = ['user', 'admin'];

/**
 * Candlesticks Schema
 * @private
 */
const candleStickSchema = new mongoose.Schema(
  {
    cid: {
      type: String,
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      index: true,
    },
    a: {
      type: Number,
    },
    b: {
      type: Number,
    },
    c: {
      type: Number,
    },
    d: {
      type: Number,
    },
    volume: {
      type: Number,
    },
    trades: {
      type: Number,
    },
    quote_volume: {
      type: Number,
    },
    buy_volume: {
      type: Number,
    },
    quote_buy_volume: {
      type: Number,
    },
    time_stamp: {
      type: Number,
    },
    time_frame: {
      type: Number,
    },
    remaining: {
      type: Number,
    },
    mdc_index: {
      type: String,
    },
    color: {
      type: String,
    },
    time: {
      type: String,
    },
    rsi: {
      type: Number,
    },
    bollingerbands: {
      type: Schema.Types.Mixed,
    },
    ma89: {
      type: Number,
    },
    fx_cases: {
      type: String,
    },
    fx_point: {
      type: Number,
    },
    fx_support_per: {
      type: Number,
    },
    signals: {
      type: [
        {
          type: String,
        },
      ],
    },
  },
  {
    versionKey: false,
    // _id: false
  },
);

/**
 * Statics
 */
candleStickSchema.statics = {
  roles: roles as any,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(symbol) {
    let data;

    if (symbol) {
      data = await this.findOne({ symbol }).sort({ created_at: 'desc' }).exec();
    }
    if (data) {
      return data;
    }

    throw new (APIError as any)({
      message: 'Symbol does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },
};

const models = {};
chartTimeFrames.forEach((tf) => {
  models[tf] = mongoose.connection
    .useDb('1trading')
    .model(`candlesticks_${tf}`, candleStickSchema, `candlesticks_${tf}`);
});

/**
 * @typedef Candlesticks
 */
export default models;
