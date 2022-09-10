import express from 'express';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';

@injectable()
export class QuestionsAmount {
  public get CONST_QUESTIONS() {
    return 5;
  }
}

@injectable()
export class QuizService {
  private count;
  constructor(
    @inject(QuestionsAmount) protected questionsAmount: QuestionsAmount,
    @inject(PlayersRepositoryDB) protected playersRepositoryDB: PlayersRepositoryDB,
    @inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB,
  ) {
    this.count = 0;
  }

  async countRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    const player = await this.playersRepositoryDB.findPlayerByUserId(req.user!._id!);
    if (typeof player !== 'string') {
      const activeGame = await this.gamesRepositoryDB.getActiveGameByPlayerId(player!._id!);
      if (typeof activeGame !== 'string') {
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(403);
    }
    if (this.count >= this.questionsAmount.CONST_QUESTIONS) {
      res.sendStatus(403);
    } else {
      req.countRequest = this.count;
      this.count += 1;
      return next();
    }
  }
}
