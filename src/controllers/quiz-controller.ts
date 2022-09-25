import express from 'express';
import { injectable, inject } from 'inversify';
import { toNumber } from 'lodash';
import { ObjectId } from 'mongodb';
import { IGameSchema } from '../models/gamesModel';
import { IPlayersSchema } from '../models/playersModel';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';
import { IMyCurrentGameResponse, IPlayer, IAnswer, IUserQuiz } from '../types';
import { ResponseHelper } from '../utils/response-helper';
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
    @inject(ResponseHelper) protected responseHelper: ResponseHelper,
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

  // async getMyCurrentPair(req: express.Request, res: express.Response) {
  //   let player: IPlayersSchema | string | null;
  //   // if (req.path === '/pairs/my-current'){
  //   console.log(req.path, req.params.id);
  //   if (!req.params.id) {
  //     player = await this.playersRepositoryDB.findActiveOrPendingPlayerByUserId(req.user!._id!);
  //   } else {
  //     player = await this.playersRepositoryDB.findPlayerByGameId(req.params.id);
  //   }
  //
  //   if (typeof player !== 'string' && player) {
  //     const currentGame = await this.gamesRepositoryDB.getGameByIdWithPlayersPopulate(player.gameId);
  //     if (typeof currentGame !== 'string' && currentGame) {
  //       return res.status(200).send(this.responseHelper.currentPairsResponse(currentGame));
  //     }
  //     if (typeof currentGame === 'string') {
  //       return res.status(400).send(`Dd error: ${currentGame}`);
  //     }
  //     if (!currentGame) {
  //       return res.sendStatus(404);
  //     }
  //   }
  // }

  async gameDataHelper(gameId: ObjectId) {
    return async (req: express.Request, res: express.Response, next: express.Response) => {
      const currentGame = await this.gamesRepositoryDB.getGameByIdWithPlayersPopulate(gameId);
      if (typeof currentGame !== 'string' && currentGame) {
        return res.status(200).send(this.responseHelper.currentPairsResponse(currentGame));
      }
      if (typeof currentGame === 'string') {
        return res.status(400).send(`Dd error: ${currentGame}`);
      }
      if (!currentGame) {
        return res.sendStatus(404);
      }
    };
  }

  async getMyCurrentPair(req: express.Request, res: express.Response) {
    const player = await this.playersRepositoryDB.findActiveOrPendingPlayerByUserId(req.user!._id!);
    if (typeof player !== 'string' && player) {
      return await this.gameDataHelper(player.gameId._id);
    } else {
      return res.status(400).send(`Dd error: ${player}`);
    }
  }

  async getGameById(req: express.Request, res: express.Response) {
    const player = await this.playersRepositoryDB.findPlayerByGameId(req.params.id);
    if (typeof player !== 'string' && player) {
      await this.gameDataHelper(player.gameId);
    } else {
      return res.status(400).send(`Dd error: ${player}`);
    }
  }

  //
  // async getMyCurrentPair(req: express.Request, res: express.Response) {
  //   const player = await this.playersRepositoryDB.findActiveOrPendingPlayerByUserId(req.user!._id!);
  //   if (typeof player !== 'string' && player) {
  //     const currentGame = await this.gamesRepositoryDB.getGameByIdWithPlayersPopulate(player.gameId._id);
  //     if (typeof currentGame !== 'string' && currentGame) {
  //       return res.status(200).send(this.responseHelper.currentPairsResponse(currentGame));
  //     }
  //     if (typeof currentGame === 'string') {
  //       return res.status(400).send(`Dd error: ${currentGame}`);
  //     }
  //     if (!currentGame) {
  //       return res.sendStatus(404);
  //     }
  //   }
  // }
  //
  // async getGameById(req: express.Request, res: express.Response) {
  //   const player = await this.playersRepositoryDB.findPlayerByGameId(req.params.id);
  //   if (typeof player !== 'string' && player) {
  //     const currentGame = await this.gamesRepositoryDB.getGameByIdWithPlayersPopulate(player.gameId);
  //     if (typeof currentGame !== 'string' && currentGame) {
  //       return res.status(200).send(this.responseHelper.currentPairsResponse(currentGame));
  //     }
  //     if (typeof currentGame === 'string') {
  //       return res.status(400).send(`Dd error: ${currentGame}`);
  //     }
  //     if (!currentGame) {
  //       return res.sendStatus(404);
  //     }
  //   }
  // }
  //
  async getAllUsersGames(req: express.Request, res: express.Response) {
    const player = await this.playersRepositoryDB.findAllPlayersByUserId(
      req.user!._id!,
      toNumber(req.query?.PageSize),
      toNumber(req.query?.PageNumber),
    );
    let allGames: any;
    if (typeof player !== 'string' && player) {
      try {
        allGames = await Promise.all(
          player.map(async (elem) => {
            const game = await this.gamesRepositoryDB.getGameByIdWithPlayersPopulate(elem.gameId);
            return this.responseHelper.currentPairsResponse(game);
          }),
        );
      } catch (error) {
        return res.status(400).send(`Dd error: ${error}`);
      }
      let totalCount: number | undefined = 0;
      let totalPages = 0;
      const pageSize = parseInt(req.query?.PageSize as string) || 10;
      const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
      totalCount = await this.playersRepositoryDB.countAllPlayersByUserId(req.user!._id!);

      totalPages = Math.ceil((totalCount || 0) / pageSize);
      return res.status(200).send({
        pagesCount: totalPages,
        page: pageNumber,
        pageSize,
        totalCount,
        items: allGames,
      });
    } else {
      return res.status(400).send(`Dd error: ${player}`);
    }
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
      (req.currentPlayer && req.currentPlayer.numberAnswer >= countQuestions) ||
      !req.currentActiveGame
    ) {
      res.sendStatus(403);
    } else {
      let notCurrentPlayer: IPlayersSchema | null;
      if (req.currentActiveGame.firstPlayerId === req.currentPlayer._id) {
        notCurrentPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.secondPlayerId);
      } else {
        notCurrentPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.firstPlayerId);
      }
      const sendAnswer = await this.playersRepositoryDB.setAnswerPlayer({
        playerId: req.currentPlayer._id,
        answer: req.body.answer,
        notCurrentPlayerNumberAnswer: notCurrentPlayer!.numberAnswer,
      });
      const firstPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.firstPlayerId);
      const secondPlayer = await this.playersRepositoryDB.getPlayerById(req.currentActiveGame.secondPlayerId);
      if (firstPlayer && secondPlayer) {
        await this.playersRepositoryDB.checkSettingBonusScore({ firstPlayer, secondPlayer });
      }
      if (firstPlayer!.numberAnswer >= countQuestions && secondPlayer!.numberAnswer >= countQuestions) {
        await this.gamesRepositoryDB.finishActiveGameById(firstPlayer!, secondPlayer!);
      }

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
