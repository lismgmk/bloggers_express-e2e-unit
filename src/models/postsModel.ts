import mongoose from 'mongoose';
import { db_posts_collection_name_str } from '../connect-db';
import { IPosts } from '../types';

const { Schema } = mongoose;

export const postsSchema = new Schema<IPosts>({
  _id: mongoose.Types.ObjectId,
  shortDescription: String,
  content: String,
  title: String,
  bloggerId: { type: Schema?.Types.ObjectId, ref: 'Bloggers' },
  extendedLikesInfo: { type: Schema?.Types.ObjectId, ref: 'Likes' },
});

export const Posts = mongoose.model('Posts', postsSchema, db_posts_collection_name_str);
