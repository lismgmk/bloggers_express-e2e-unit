import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { db_players_collection_name_str } from '../connect-db';
import { IAnswer } from '../types';
import { answersSchema } from './answersModel';

const { Schema } = mongoose;
export interface IPlayersSchema {
  _id: ObjectId;
  userId: ObjectId;
  login: string;
  gameId: ObjectId;
  answers: IAnswer[] | null;
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
    gameId: {
      type: Schema?.Types.ObjectId,
      required: true,
    },
    answers: [
      {
        type: answersSchema,
        required: false,
      },
    ],
  },
  { versionKey: false },
);
export const Players = mongoose.model<IPlayersSchema>('Players', playersSchema, db_players_collection_name_str);
