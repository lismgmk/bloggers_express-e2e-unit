import mongoose from 'mongoose';
import { db_black_list_tokens_collection_name_str } from '../connect-db';
import { IBlackList } from '../types';
const { Schema } = mongoose;

export const blackListSchema = new Schema<IBlackList>(
  {
    tokenValue: { type: String, required: true, unique: true },
  },
  { versionKey: false },
);

export const BlackList = mongoose.model('BlackList', blackListSchema, db_black_list_tokens_collection_name_str);
