import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { db_answers_collection_name_str } from '../connect-db';
import { IAnswerStatus } from '../types';

const { Schema } = mongoose;
export interface IAnswerSchema {
  questionId: ObjectId;
  answerStatus: IAnswerStatus;
  addedAt: Date;
  numberQuestion: number;
}

export const answersSchema = new Schema<IAnswerSchema>(
  {
    answerStatus: {
      type: String,
      required: true,
    },
    addedAt: Date,
    questionId: { type: Schema?.Types.ObjectId, ref: 'Questions', required: true },
    numberQuestion: Number,
  },
  { versionKey: false },
);
export const Answers = mongoose.model<IAnswerSchema>('Answers', answersSchema, db_answers_collection_name_str);
