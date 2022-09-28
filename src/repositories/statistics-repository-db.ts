import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { IPlayersSchema } from '../models/playersModel';
import { Statistics, IStatisticsPlayersModel } from '../models/statisticsPlayersModel';
export type StatusGameType = 'win' | 'lose' | 'draw';
interface IStatisticsUpdateProp {
  userId: ObjectId;
  login: string;
  score: number;
  win: StatusGameType;
}

@injectable()
export class StatisticsRepositoryDb {
  helperResultGame(statusGame: StatusGameType): { winsCount: number; losesCount: number } {
    if (statusGame === 'win') {
      return { winsCount: 1, losesCount: 0 };
    }
    if (statusGame === 'lose') {
      return { winsCount: 0, losesCount: 1 };
    } else {
      return { winsCount: 0, losesCount: 0 };
    }
  }

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
          winsCount: this.helperResultGame(updateData.win).winsCount,
          lossesCount: this.helperResultGame(updateData.win).losesCount,
        });
        await Statistics.create(newStatistics);
      } else {
        if (updateData.win === 'win') {
          userStatistics.sumScore += updateData.score;
          userStatistics.winsCount += 1;
        }
        if (updateData.win === 'lose') {
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
        .sort({ sumScore: -1 })
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
    const statistics: {
      firstPlayerStatisticData: IStatisticsUpdateProp;
      secondPlayerStatisticData: IStatisticsUpdateProp;
    } = {
      firstPlayerStatisticData: {} as IStatisticsUpdateProp,
      secondPlayerStatisticData: {} as IStatisticsUpdateProp,
    };
    if (winner === 'first') {
      statistics.firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: firstPlayer!.score,
        win: 'win',
      };
      statistics.secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: 0,
        win: 'lose',
      };
    }
    if (winner === 'second') {
      statistics.firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: 0,
        win: 'lose',
      };
      statistics.secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: secondPlayer!.score,
        win: 'win',
      };
    }
    if (winner === 'draw') {
      statistics.firstPlayerStatisticData = {
        userId: firstPlayer!.userId,
        login: firstPlayer!.login,
        score: 0,
        win: 'draw',
      };
      statistics.secondPlayerStatisticData = {
        userId: secondPlayer!.userId,
        login: secondPlayer!.login,
        score: 0,
        win: 'draw',
      };
    }
    await this.upDateUserStatistics(statistics.firstPlayerStatisticData);
    await this.upDateUserStatistics(statistics.secondPlayerStatisticData);
  }
}
