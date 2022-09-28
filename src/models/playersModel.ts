import { ObjectId } from 'mongodb';
import mongoose, { Schema } from 'mongoose';
import { db_players_collection_name_str } from '../connect-db';
import { IAnswer } from '../types';
import { answersSchema } from './answersModel';

export interface IPlayersSchema {
  _id: ObjectId;
  userId: ObjectId;
  login: string;
  gameId: any;
  answers: IAnswer[] | null;
  numberAnswer: number;
  score: number;
  startTimeQuestion: Date;
}

export const playersSchema = new Schema<IPlayersSchema>(
  {
    userId: {
      type: Schema?.Types.ObjectId,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    gameId: { type: Schema?.Types.ObjectId, ref: 'Games', required: true },
    numberAnswer: { type: Number, default: 0 },
    answers: [
      {
        type: answersSchema,
        required: false,
      },
    ],
    score: { type: Number, default: 0 },
    startTimeQuestion: Date,
  },
  { versionKey: false },
);
export const Players = mongoose.model<IPlayersSchema>('Players', playersSchema, db_players_collection_name_str);
