import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { IPlayersSchema } from '../models/playersModel';
import { IQuestionSchema } from '../models/questionsModel';
import { IGameStatus, IMyCurrentGameResponse } from '../types';

export interface IGameProp {
  _id: ObjectId;
  gameStatus: IGameStatus;
  questions: IQuestionSchema[];
  firstPlayerId: IPlayersSchema;
  secondPlayerId: IPlayersSchema;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
  winnerUserId: ObjectId;
}

@injectable()
export class ResponseHelper {
  // currentPairsResponse(game: IGameProp): IMyCurrentGameResponse {
  currentPairsResponse(game: any): IMyCurrentGameResponse {
    const firstPlayerAnswers = game.firstPlayerId.answers;
    const firstPlayerUser = { id: game.firstPlayerId.userId.toString(), login: game.firstPlayerId.login };
    const firstPlayerScore = game.firstPlayerId.score;

    const secondPlayerAnswers = game.secondPlayerId.answers;
    const secondPlayerUser = { id: game.secondPlayerId.userId.toString(), login: game.secondPlayerId.login };
    const secondPlayerScore = game.secondPlayerId.score;

    const questions = game.questions.map((el: any) => ({ id: el._id.toString(), body: el.body }));
    return {
      id: game._id.toString(),
      firstPlayer: { answers: firstPlayerAnswers, user: firstPlayerUser, score: firstPlayerScore },
      secondPlayer: { answers: secondPlayerAnswers, user: secondPlayerUser, score: secondPlayerScore },
      questions,
      status: game.gameStatus,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}
