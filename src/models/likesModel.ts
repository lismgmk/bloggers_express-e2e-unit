import mongoose from 'mongoose';
import { db_likes_collection_name_str } from '../connect-db';
import { ILikes, myStatus } from '../types';

const { Schema } = mongoose;

export const likesSchema = new Schema<ILikes>({
  _id: mongoose.Types.ObjectId,
  postId: { type: Schema?.Types.ObjectId, ref: 'Posts' },
  commentId: { type: Schema?.Types.ObjectId, ref: 'Comments' },
  addedAt: Date,
  likesCount: Number,
  dislikesCount: Number,
  myStatus: { type: String, required: true },
  newestLikes: [
    {
      addedAt: Date,
      userId: String,
      login: String,
    },
  ],
});

export const Likes = mongoose.model('Likes', likesSchema, db_likes_collection_name_str);
