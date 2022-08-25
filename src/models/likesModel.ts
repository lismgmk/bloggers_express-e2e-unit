import mongoose from 'mongoose';
import { db_likes_collection_name_str } from '../connect-db';
import { ILikes } from '../types';

const { Schema } = mongoose;

export const likesSchema = new Schema<ILikes>(
  {
    postId: { type: Schema?.Types.ObjectId, ref: 'Posts' },
    commentId: { type: Schema?.Types.ObjectId, ref: 'Comments' },
    addedAt: Date,
    myStatus: { type: String, required: true },
    login: { type: String, required: true },
    userId: { type: Schema?.Types.ObjectId, ref: 'Users' },
  },
  { versionKey: false },
);

export const Likes = mongoose.model('Likes', likesSchema, db_likes_collection_name_str);
