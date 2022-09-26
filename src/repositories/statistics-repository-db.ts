import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { IPlayersSchema } from '../models/playersModel';
import { Statistics, IStatisticsPlayersModel } from '../models/statisticsPlayersModel';

interface IStatisticsUpdateProp {
  userId: ObjectId;
  login: string;
  score: number;
  win: boolean;
}

@injectable()
export class StatisticsRepositoryDb {
  async upDateUserStatistics(updateData: IStatisticsUpdateProp) {
    try {
      const userStatistics = await Statistics.findOne({ userId: updateData.userId });
      if (!userStatistics) {
        const newStatistics = new Statistics({
          userId: updateData.userId,
          login: updateData.login,
          sumScore: updateData.win ? updateData.score : 0,
          avgScores: updateData.score,
          gamesCount: 1,
          winsCount: updateData.win ? 1 : 0,
          lossesCount: updateData.win ? 0 : 1,
        });
        await Statistics.create(newStatistics);
      } else {
        if (updateData.win) {
          userStatistics.sumScore += updateData.score;
          userStatistics.winsCount += 1;
        }
        if (!updateData.win) {
          userStatistics.lossesCount += 1;
        }
        userStatistics.avgScores = (userStatistics.sumScore + updateData.score) / (userStatistics.gamesCount + 1);
        userStatistics.gamesCount += 1;
        userStatistics.save();
      }
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async getAllStatistics(pageSize: number, pageNumber: number): Promise<IStatisticsPlayersModel[] | string | null> {
    try {
      return await Statistics.find({})
        .sort({ sumScore: 1 })
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .exec();
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async countAllStatistics(): Promise<number> {
    return await Statistics.countDocuments().exec();
  }

  async setStatisticsHelper(
    firstPlayer: IPlayersSchema,
    secondPlayer: IPlayersSchema,
    winner: 'first' | 'second' | 'draw',
  ) {
    let firstPlayerStatisticData: IStatisticsUpdateProp;
    let secondPlayerStatisticData: IStatisticsUpdateProp;
    if (winner === 'first') {
      firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: firstPlayer!.score,
        win: true,
      };
      secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: 0,
        win: false,
      };
    }
    if (winner === 'second') {
      firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: 0,
        win: false,
      };
      secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: secondPlayer!.score,
        win: true,
      };
    } else {
      firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: 0,
        win: false,
      };
      secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: 0,
        win: false,
      };
    }

    await this.upDateUserStatistics(firstPlayerStatisticData);
    await this.upDateUserStatistics(secondPlayerStatisticData);
  }
}
