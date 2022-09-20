import express from 'express';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { IGameSchema } from '../models/gamesModel';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';
import { IMyCurrentGameResponse, IPlayer, IAnswer, IUserQuiz } from '../types';
import { countQuestions } from '../variables';

@injectable()
export class QuizController {
  public player_1: IPlayer;
  public player_2: IPlayer;
  public answer: IAnswer;
  public currentPairs: IMyCurrentGameResponse;
  public user_1: IUserQuiz;
  public user_2: IUserQuiz;

  constructor(
    @inject(GamesRepositoryDB) protected gamesRepositoryDB: GamesRepositoryDB,
    @inject(PlayersRepositoryDB) protected playersRepositoryDB: PlayersRepositoryDB,
  ) {
    this.user_1 = {
      id: '1234',
      login: 'Login',
    };
    this.user_2 = {
      id: '1234',
      login: 'Login',
    };
    this.answer = { questionId: '1238', answerStatus: 'Correct', addedAt: new Date(), correctAnswer: 'yes' };
    this.player_1 = {
      answers: [this.answer],
      user: this.user_1,
      score: 0,
    };
    this.player_2 = {
      answers: [this.answer],
      user: this.user_2,
      score: 0,
    };
    this.currentPairs = {
      id: '123',
      firstPlayer: this.player_1,
      secondPlayer: this.player_2,
      questions: [{ id: '1234', body: 'some question' }],
      status: 'Active',
      pairCreatedDate: new Date(),
      startGameDate: new Date(),
      finishGameDate: new Date(),
    };
  }

  async getMyCurrentPair(req: express.Request, res: express.Response) {
    return res.status(200).send(this.currentPairs);
  }
  async getGameById(req: express.Request, res: express.Response) {
    return res.status(200).send(this.currentPairs);
  }
  getAllUsersGames(req: express.Request, res: express.Response) {
    return res.status(200).send({
      pagesCount: 1,
      page: 1,
      pageSize: 3,
      totalCount: 2,
      items: [this.currentPairs],
    });
  }
  async connectionToGame(req: express.Request, res: express.Response) {
    if (req.currentActiveGame) {
      return res.sendStatus(403);
    }
    const startedGames = (await this.gamesRepositoryDB.getStartedGame()) as IGameSchema;
    const userParams: { userId: ObjectId; login: string } = {
      userId: req.user!._id!,
      login: req.user!.accountData!.userName!,
    };
    let newGame: IGameSchema | string | null;

    if (startedGames) {
      newGame = await this.gamesRepositoryDB.createPair({
        secondPlayerId: userParams.userId,
        login: userParams.login,
        gameId: startedGames._id,
        questions: startedGames.questions,
      });
    } else {
      const gameId = new ObjectId();
      newGame = await this.gamesRepositoryDB.createNewGame({ ...userParams, gameId });
    }
    return res.status(200).send(newGame);
  }
  async sendAnswer(req: express.Request, res: express.Response) {
    if (
      !req.currentPlayer ||
      (req.currentPlayer && req.currentPlayer.numberAnswer > countQuestions) ||
      !req.currentActiveGame
    ) {
      res.sendStatus(403);
    } else {
      const sendAnswer = await this.playersRepositoryDB.setAnswerPlayer({
        playerId: req.currentPlayer._id,
        answer: req.body.answer,
      });
      const firstPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.firstPlayerId);
      const secondPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.secondPlayerId);

      if (firstPlayer!.numberAnswer === countQuestions && secondPlayer!.numberAnswer === countQuestions) {
        await this.gamesRepositoryDB.finishActiveGameById(req.currentActiveGame);
      }
      if (firstPlayer && secondPlayer) {
        await this.playersRepositoryDB.checkSettingBonusScore({ firstPlayer, secondPlayer });
      }

      // const countAnswersFirstPlayer = await this.playersRepositoryDB.checkNumberAnswer(
      //   req.currentActiveGame.firstPlayerId,
      // );
      // const countAnswersSecondPlayer = await this.playersRepositoryDB.checkNumberAnswer(
      //   req.currentActiveGame.secondPlayerId,
      // );

      return res.status(200).send(sendAnswer);
    }
  }
  async getTopUsers(req: express.Request, res: express.Response) {
    res.status(200).send({
      pagesCount: 0,
      page: 0,
      pageSize: 0,
      totalCount: 0,
      items: [
        {
          user: this.user_1,
          sumScore: 0,
          avgScores: 0,
          gamesCount: 0,
          winsCount: 0,
          lossesCount: 0,
        },
      ],
    });
  }
}
