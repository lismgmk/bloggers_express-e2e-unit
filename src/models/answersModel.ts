import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { db_answers_collection_name_str } from '../connect-db';
import { IAnswerStatus } from '../types';

const { Schema } = mongoose;
export interface IAnswerSchema {
  questionId: ObjectId;
  answerStatus: IAnswerStatus;
  addedAt: Date;
  body: string;
  correctAnswer: string;
}

export const answersSchema = new Schema<IAnswerSchema>(
  {
    answerStatus: {
      type: String,
      required: false,
    },
    addedAt: Date,
    questionId: { type: Schema?.Types.ObjectId, required: true },
    body: { type: String, required: true },
    correctAnswer: { type: String, required: true },
  },
  { versionKey: false },
);
export const Answers = mongoose.model<IAnswerSchema>('Answers', answersSchema, db_answers_collection_name_str);
