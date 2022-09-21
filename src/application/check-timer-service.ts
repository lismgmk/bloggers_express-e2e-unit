import { differenceInMilliseconds } from 'date-fns';
import { injectable, inject } from 'inversify';
import { toNumber } from 'lodash';
import { IGameSchema } from '../models/gamesModel';
import { IPlayersSchema } from '../models/playersModel';
import { GamesRepositoryDB } from '../repositories/games-repository-db';

@injectable()
export class CheckTimerService {
  constructor(@inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB) {}

  async checkTimer(player: IPlayersSchema, activeGame: IGameSchema) {
    // console.log(differenceInMilliseconds(new Date(), player.startTimeQuestion), 'ddddddddddddddddddddddddd');
    // if (player.startTimeQuestion && differenceInMilliseconds(new Date(), player.startTimeQuestion) > decideTimeAnswer) {
    if (
      player.startTimeQuestion &&
      differenceInMilliseconds(new Date(), player.startTimeQuestion) > toNumber(process.env.DECIDE_TIME_ANSWERS)
    ) {
      if (player._id.equals(activeGame.firstPlayerId)) {
        await this.gamesRepositoryDB.upDateGameAfterFinish(activeGame._id, {
          finishGameDate: new Date(),
          winnerUserId: activeGame.secondPlayerId!,
          gameStatus: 'Finished',
        });
        return 'gameOver';
      }
      if (player._id.equals(activeGame.secondPlayerId)) {
        await this.gamesRepositoryDB.upDateGameAfterFinish(activeGame._id, {
          finishGameDate: new Date(),
          winnerUserId: activeGame.firstPlayerId!,
          gameStatus: 'Finished',
        });
        return 'gameOver';
      }
    }
  }
}
