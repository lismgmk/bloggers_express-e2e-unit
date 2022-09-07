import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { Bloggers } from '../models/bloggersModel';
import { Games, IGameSchema } from '../models/gamesModel';
import { Players } from '../models/playersModel';
import { IBloggers, IPaginationResponse } from '../types';

@injectable()
export class GamesRepositoryDB {
  async getAllUserGame(pageSize: number, pageNumber: number, userId: string): Promise<IPaginationResponse<IBloggers>> {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    totalCount = await Players.find({ $or: [{ userId: userId }, { secondPlayerId: userId }] })
      .count()
      .lean();
    const allBloggers = await (
      await Bloggers.find({ name: namePart })
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .lean()
    ).map((i) => {
      return { id: i._id, name: i.name, youtubeUrl: i.youtubeUrl };
    });
    if (allBloggers) {
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: allBloggers,
    };
  }

  async createNewGame(gameData: { userId: string }): Promise<IGameSchema | string> {
    const gameId = new ObjectId();
    const playerId = new ObjectId();
    const newPlayer = new Players({
      _id: playerId,
      userId: gameData.userId,
      secondPlayerId: null,
      gameId: gameId,
      answersId: null,
    });
    await Players.create(newPlayer);
    const newGame = new Games({
      ...gameData,
      gameStatus: 'PendingSecondPlayer',
      secondPlayerId: null,
      pairCreatedDate: null,
      startGameDate: new Date(),
      finishGameDate: null,
      firstPlayerScore: null,
      secondPlayerScore: null,
      winnerUserId: null,
    });
    try {
      await Games.create(newGame);
      return newGame;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async createPair(gamePairData: { gameId: ObjectId; secondPlayerId: ObjectId }) {
    try {
      const update = { gameStatus: 'Active', secondPlayerId: gamePairData.secondPlayerId, pairCreatedDate: new Date() };
      return await Games.findByIdAndUpdate(gamePairData.gameId, { $set: update });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getBloggerById(id: string) {
    return Bloggers.findById(id);
  }
  async upDateBlogger(name: string, youtubeUrl: string, id: string) {
    try {
      return await Bloggers.findByIdAndUpdate(id, { $set: { name, youtubeUrl } });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async deleteBlogger(id: string) {
    try {
      const idVal = new ObjectId(id);
      return await Bloggers.findByIdAndDelete(idVal);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
