import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { db_questions_str } from '../connect-db';

const { Schema } = mongoose;
export interface IQuestionSchema {
  _id: ObjectId;
  body: string;
  correctAnswer: string;
}
export const questionSchema = new Schema<IQuestionSchema>(
  {
    body: { type: String, required: true },
    correctAnswer: { type: String, required: true },
  },
  { versionKey: false },
);
export const Questions = mongoose.model<IQuestionSchema>('Questions', questionSchema, db_questions_str);
