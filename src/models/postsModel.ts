import mongoose, { PopulatedDoc, Types } from 'mongoose';
import { db_posts_collection_name_str } from '../connect-db';
import { IBloggers, ILikes } from '../types';

const { Schema } = mongoose;
export type GroupDocument = {
  _id?: Types.ObjectId;
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerName: string;
  extendedLikesInfo: PopulatedDoc<ILikes>[];
  bloggerId: PopulatedDoc<IBloggers>[];
} & mongoose.Document;

export const postsSchema = new Schema(
  {
    _id: mongoose.Types.ObjectId,
    shortDescription: String,
    content: String,
    title: String,
    bloggerId: { type: Schema?.Types.ObjectId, ref: 'Bloggers' },
    extendedLikesInfo: { type: Schema?.Types.ObjectId, ref: 'Likes' },
  },
  { versionKey: false },
);

export const Posts = mongoose.model<GroupDocument>('Posts', postsSchema, db_posts_collection_name_str);
