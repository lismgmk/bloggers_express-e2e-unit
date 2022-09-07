import { ObjectId } from 'mongodb';
import mongoose, { Types } from 'mongoose';
import { db_games_collection_name_str } from '../connect-db';
import { IGameStatus } from '../types';

const { Schema } = mongoose;
export interface IGameSchema {
  gameStatus: IGameStatus;
  questions: ObjectId[];
  firstPlayerId: ObjectId;
  secondPlayerId: ObjectId;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  firstPlayerScore: number;
  secondPlayerScore: number;
  winnerUserId: ObjectId;
}

export const gamesSchema = new Schema<IGameSchema>(
  {
    gameStatus: {
      type: String,
      required: true,
    },
    questions: {
      type: [Types.ObjectId],
      required: true,
      ref: 'Questions',
    },
    firstPlayerId: {
      type: Schema?.Types.ObjectId,
      required: true,
      ref: 'Players',
    },
    secondPlayerId: {
      type: Schema?.Types.ObjectId,
      required: false,
      ref: 'Players',
    },
    pairCreatedDate: Date,
    startGameDate: Date,
    finishGameDate: Date,
    winnerUserId: Schema?.Types.ObjectId,
    firstPlayerScore: Number,
    secondPlayerScore: Number,
  },
  { versionKey: false },
);
export const Games = mongoose.model<IGameSchema>('Games', gamesSchema, db_games_collection_name_str);
