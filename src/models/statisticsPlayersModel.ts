import { ObjectId } from 'mongodb';
import mongoose, { Schema } from 'mongoose';
import { db_statistics_collection_name_str } from '../connect-db';

export interface IStatisticsPlayersModel {
  _id: ObjectId;
  userId: ObjectId;
  login: string;
  sumScore: number;
  avgScores: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
}

export const statisticsPlayersModel = new Schema<IStatisticsPlayersModel>(
  {
    userId: {
      type: Schema?.Types.ObjectId,
      required: true,
    },
    login: {
      type: String,
      required: true,
    },
    sumScore: { type: Number, default: 0 },
    avgScores: { type: Number, default: 0 },
    gamesCount: { type: Number, default: 0 },
    winsCount: { type: Number, default: 0 },
    lossesCount: { type: Number, default: 0 },
  },
  { versionKey: false },
);
export const Statistics = mongoose.model<IStatisticsPlayersModel>(
  'Statistics',
  statisticsPlayersModel,
  db_statistics_collection_name_str,
);
