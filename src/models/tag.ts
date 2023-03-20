import config from '@/config';
import { ITag } from '@/interfaces';
import mongoose, { Document } from 'mongoose';

/**
 * schema
 * @private
 */
const schema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: String,
    description: String,
    source: String,
    volume: Number,
    updated_at: String,
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

const name = 'tag'
export default mongoose.connection
  .useDb(config.mongoDbNames.onchainApp)
  .model<ITag & Document>(name, schema, name);
