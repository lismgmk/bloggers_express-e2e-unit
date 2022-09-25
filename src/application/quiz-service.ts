import express from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';
import { StatisticsRepositoryDb } from '../repositories/statistics-repository-db';
import { CheckTimerService } from './check-timer-service';

@injectable()
export class QuizService {
  constructor(
    @inject(PlayersRepositoryDB) protected playersRepositoryDB: PlayersRepositoryDB,
    @inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB,
    @inject(CheckTimerService) protected checkTimerService: CheckTimerService,
    @inject(StatisticsRepositoryDb) protected statisticsRepositoryDb: StatisticsRepositoryDb,
  ) {}

  async getActivePlayerAndGame(req: express.Request, res: express.Response, next: express.NextFunction) {
    const player = await this.playersRepositoryDB.findActivePlayerByUserId(req.user!._id!);

    if (typeof player !== 'string' && player?.length > 0) {
      req.currentPlayer = player[0];
      const activeGame = await this.gamesRepositoryDB.getGameById(player![0].gameId);
      if (typeof activeGame !== 'string' && activeGame) {
        const firstPlayer = await this.playersRepositoryDB.getPlayerById(activeGame.firstPlayerId);
        const secondPlayer = await this.playersRepositoryDB.getPlayerById(activeGame.secondPlayerId);
        req.currentActiveGame = activeGame;
        const gameFirstPlayer = await this.checkTimerService.checkTimer(firstPlayer!, activeGame);
        const gameSecondPlayer = await this.checkTimerService.checkTimer(secondPlayer!, activeGame);
        if (gameFirstPlayer === 'gameOverFirst') {
          await this.statisticsRepositoryDb.setStatisticsHelper(firstPlayer!, secondPlayer!, 'second');
          return res.sendStatus(403);
        }
        if (gameSecondPlayer === 'gameOverSecond') {
          await this.statisticsRepositoryDb.setStatisticsHelper(firstPlayer!, secondPlayer!, 'first');
          return res.sendStatus(403);
        }
      }
      if (typeof activeGame === 'string') {
        return res.status(400).send(`Dd error: ${activeGame}`);
      }
    }
    if (typeof player === 'string') {
      return res.status(400).send(`Dd error: ${player}`);
    }
    return next();
  }
}
