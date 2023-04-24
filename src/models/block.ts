import config from '@/config';
import { IBlock } from '@/interfaces';
import mongoose, { Schema, Document } from 'mongoose';

const schema = new Schema(
  {
    block: Number,
    timestamp: Number,
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: false,
    },
    versionKey: false,
    strict: false,
  },
);

// TODO
const db = 'onchain' || config.mongoDbNames.onchain;
const init = (chain) => {
  const name = `${chain}-block`;
  return mongoose.connection.useDb(db).model<IBlock & Document>(name, schema, name);
};

export default init;
