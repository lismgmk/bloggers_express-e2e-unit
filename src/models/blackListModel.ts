import mongoose from 'mongoose';
import { db_black_list_tokens_collection_name_str } from '../connect-db';
import { IBlackList } from '../types';
const { Schema } = mongoose;

export const blackListSchema = new Schema<IBlackList>({
  tokenValue: { type: String, required: true, unique: true },
});

export const BlackListSchema = mongoose.model(
  'BlackListSchema',
  blackListSchema,
  db_black_list_tokens_collection_name_str,
);
