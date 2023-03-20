import config from '@/config';
import { IGroupFootprint } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    gid: String, // group wallet id
    token: String,

    amount: Number, // total amount
    min_price: Number, //
    max_price: Number, //

    from_time: Number,
    to_time: Number,

    type: String, // deposit, withdraw
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at',
    },
    versionKey: false,
  },
);

schema.index(
  {
    gid: 1,
    type: 1,
    from_time: -1,
    to_time: -1,
  },
  {
    unique: true,
    background: true,
  },
);

schema.index(
  {
    token: 1,
    from_time: -1,
    to_time: -1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    token: 1,
    amount: -1,
    from_time: -1,
    to_time: -1,
  },
  {
    background: true,
  },
);

const name = 'group-footprint'
export default mongoose.connection
  .useDb(config.mongoDbNames.onchainApp)
  .model<IGroupFootprint & Document>(name, schema, name);
