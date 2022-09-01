import mongoose from 'mongoose';
import { db_bloggers_collection_name_str } from '../connect-db';
import { IBloggers } from '../types';

const { Schema } = mongoose;

export const bloggersSchema = new Schema<IBloggers>(
  {
    name: { type: String, required: true },
    youtubeUrl: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid url`,
      },
      required: [true, 'User url number required'],
      unique: true,
    },
  },
  { versionKey: false },
);
export const Bloggers = mongoose.model<IBloggers>('Bloggers', bloggersSchema, db_bloggers_collection_name_str);
