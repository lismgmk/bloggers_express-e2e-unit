import mongoose from 'mongoose';
import { db_comments_collection_name_str } from '../connect-db';
import { IComments } from '../types';
const { Schema } = mongoose;

export const commentsSchema = new Schema<IComments>(
  {
    content: {
      type: String,
      required: true,
      min: [20, 'Too short'],
      max: [300, 'Too length'],
    },
    userId: [{ type: Schema?.Types.ObjectId, ref: 'Users', required: true }],
    addedAt: Date,
    postId: [{ type: Schema?.Types.ObjectId, ref: 'Posts', required: true }],
  },
  { versionKey: false },
);

export const Comments = mongoose.model('Comments', commentsSchema, db_comments_collection_name_str);
