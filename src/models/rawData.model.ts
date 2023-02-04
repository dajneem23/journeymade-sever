import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../errors/api-error.js';
import { mongo } from '../configs/vars.js';

/**
 * Candlesticks Roles
 */
const roles = ['user', 'admin'];

/**
 * Candlesticks Schema
 * @private
 */
const candlesticksSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    candles: {
      type: Object,
      properties: {
        open: {
          type: Number,
        },
        high: {
          type: Number,
        },
        low: {
          type: Number,
        },
        close: {
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
        timeStamp: {
          type: Date,
        },
      },
    },
    created_at: {
      type: Date,
    },
    interval: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Statics
 */
candlesticksSchema.statics = {
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

const models = mongo.rawCollections.map(name => {
  return mongoose.connection.useDb('binance').model(name, candlesticksSchema, name)
})

/**
 * @typedef Candlesticks
 */
export default models;
// mongoose.connection.useDb('binance').model('candlesticks_abc_1m', candlesticksSchema, 'candlesticks_abc_1m');
