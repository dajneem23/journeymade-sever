import config from '@/config';
import { IGroup } from '@/interfaces';
import { getModelName } from '@/utils';
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
    },
    name: String,
    description: String,

    token: {
      // symbol
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    members: {
      type: [String], // [<address>]
      require: true,
      default: [],
      validate(value) {
        if (value.length < 0) throw new Error('No members');
      },
    },
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
    id: 1,
  },
  {
    unique: true,
    background: true,
  },
);

schema.index(
  {
    token: 1,
  },
  {
    background: true,
  },
);

schema.index(
  {
    tags: 1,
  },
  {
    background: true,
  },
);

const name = getModelName('groups');
export default mongoose.connection
  .useDb(config.mongoDbName)
  .model<IGroup & Document>(name, schema, name);
