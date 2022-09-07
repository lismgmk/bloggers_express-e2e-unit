import { ObjectId } from 'mongodb';
import mongoose, { Types } from 'mongoose';
import { db_players_collection_name_str } from '../connect-db';

const { Schema } = mongoose;
export interface IPlayersSchema {
  userId: ObjectId;
  secondPlayerId?: ObjectId;
  gameId: ObjectId;
  answersId: ObjectId[];
}

export const playersSchema = new Schema<IPlayersSchema>(
  {
    userId: {
      type: Schema?.Types.ObjectId,
      required: true,
      ref: 'Users',
    },
    secondPlayerId: {
      type: Schema?.Types.ObjectId,
      required: false,
      ref: 'Users',
    },
    gameId: {
      type: Schema?.Types.ObjectId,
      required: true,
      ref: 'Games',
    },
    answersId: [
      {
        type: Types.ObjectId,
        required: true,
        ref: 'Answers',
      },
    ],
  },
  { versionKey: false },
);
export const Players = mongoose.model<IPlayersSchema>('Players', playersSchema, db_players_collection_name_str);
