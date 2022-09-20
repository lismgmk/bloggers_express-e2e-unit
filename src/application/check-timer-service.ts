import { differenceInMinutes } from 'date-fns';
import { injectable, inject } from 'inversify';
import { IPlayersSchema } from '../models/playersModel';
import { GamesRepositoryDB } from '../repositories/games-repository-db';

@injectable()
export class CheckTimerService {
  constructor(@inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB) {}

  async checkTimer(player: IPlayersSchema) {
    if (player.startTimeQuestion && differenceInMinutes(new Date(), player.startTimeQuestion) > 1) {
      const currentGame = await this.gamesRepositoryDB.getActiveGameByPlayerId(player._id);
      if (currentGame && typeof currentGame !== 'string' && player._id === currentGame.firstPlayerId) {
        await this.gamesRepositoryDB.upDateGameAfterFinish(currentGame._id, {
          finishGameDate: new Date(),
          winnerUserId: currentGame.secondPlayerId!,
          gameStatus: 'Finished',
        });
        return 'gameOver';
      }
      if (currentGame && typeof currentGame !== 'string' && player._id === currentGame.secondPlayerId) {
        await this.gamesRepositoryDB.upDateGameAfterFinish(currentGame._id, {
          finishGameDate: new Date(),
          winnerUserId: currentGame.firstPlayerId!,
          gameStatus: 'Finished',
        });
        return 'gameOver';
      }
    }
  }
}
