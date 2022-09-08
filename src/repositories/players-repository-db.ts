import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { Players, IPlayersSchema } from '../models/playersModel';

@injectable()
export class PlayersRepositoryDB {
  async createNewPlayers(playerData: {
    userId: ObjectId;
    playerId: ObjectId;
    gameId: ObjectId;
    login: string;
  }): Promise<IPlayersSchema | string> {
    try {
      const newPlayer = new Players({
        _id: playerData.playerId,
        userId: playerData.userId,
        login: playerData.login,
        gameId: playerData.gameId,
        answers: [],
      });
      await Players.create(newPlayer);
      return newPlayer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
