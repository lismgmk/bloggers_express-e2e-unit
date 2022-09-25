import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { Players, IPlayersSchema } from '../models/playersModel';
import { IQuestionSchema } from '../models/questionsModel';
import { IResPlayer } from '../types';
import { PlayersQuestionsAnswersHelper } from '../utils/players-questions-answer-helper';
import { countQuestions } from '../variables';

@injectable()
export class PlayersRepositoryDB {
  constructor(
    @inject(PlayersQuestionsAnswersHelper)
    protected playersQuestionsAnswersHelper: PlayersQuestionsAnswersHelper,
  ) {}

  async createNewPlayers(playerData: {
    userId: ObjectId;
    playerId: ObjectId;
    gameId: ObjectId;
    login: string;
    questions: IQuestionSchema[];
  }): Promise<IPlayersSchema | string> {
    try {
      const newPlayer = new Players({
        _id: playerData.playerId,
        userId: playerData.userId,
        login: playerData.login,
        gameId: playerData.gameId,
        answers: this.playersQuestionsAnswersHelper.answerItem(playerData.questions),
        numberAnswer: 0,
        score: 0,
        startTimeQuestion: null,
      });
      await Players.create(newPlayer);
      return newPlayer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async findActivePlayerByUserId(userId: ObjectId): Promise<IPlayersSchema[] | string> {
    try {
      const player = await Players.find({ userId })
        .populate({
          path: 'gameId',
          match: {
            gameStatus: 'Active',
          },
        })
        .exec();
      return player;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async findActiveOrPendingPlayerByUserId(userId: ObjectId): Promise<IPlayersSchema | string | null> {
    try {
      const player = await Players.findOne({ userId })
        .populate({
          path: 'gameId',
          match: {
            $or: [{ gameStatus: 'Active' }, { gameStatus: 'PendingSecondPlayer' }],
          },
        })
        .exec();
      return player;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async findAllPlayersByUserId(
    userId: ObjectId,
    pageSize: number,
    pageNumber: number,
  ): Promise<IPlayersSchema[] | string | null> {
    try {
      const player = await Players.find({ userId })
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .exec();
      return player;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async countAllPlayersByUserId(userId: ObjectId): Promise<number> {
    return await Players.countDocuments({ userId }).exec();
  }

  async findPlayerByUserId(userId: ObjectId): Promise<IPlayersSchema | string | null> {
    try {
      const player = await Players.findOne({ userId }).exec();
      return player;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async findPlayerByGameId(gameId: string): Promise<IPlayersSchema | string | null> {
    try {
      const player = await Players.findOne({ gameId }).exec();
      return player;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getPlayerById(id: ObjectId) {
    return Players.findById(id);
  }

  async setAnswerPlayer(answerData: {
    playerId: ObjectId;
    answer: string;
    notCurrentPlayerNumberAnswer: number;
  }): Promise<Partial<IResPlayer> | string> {
    try {
      let resPlayer: Partial<IResPlayer> = {};
      const player = await Players.findById(answerData.playerId);
      player!.numberAnswer += 1;
      const currentAnswer = player!.answers![player!.numberAnswer - 1];

      if (answerData.answer === currentAnswer!.correctAnswer) {
        currentAnswer.answerStatus = 'Correct';
        player!.score += 1;
      } else {
        currentAnswer.answerStatus = 'Incorrect';
      }
      currentAnswer.addedAt = new Date();
      resPlayer = {
        questionId: new ObjectId(currentAnswer.questionId),
        answerStatus: currentAnswer.answerStatus,
        addedAt: currentAnswer.addedAt,
      };
      player!.save();

      return resPlayer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async checkSettingBonusScore(scoreData: { firstPlayer: IPlayersSchema; secondPlayer: IPlayersSchema }) {
    if (
      scoreData.firstPlayer.numberAnswer === countQuestions &&
      scoreData.firstPlayer.score >= 1 &&
      scoreData.secondPlayer.numberAnswer < countQuestions &&
      scoreData.secondPlayer.startTimeQuestion === null
    ) {
      await Players.findByIdAndUpdate(scoreData.firstPlayer._id, { $inc: { score: 1 } });
      await Players.findByIdAndUpdate(scoreData.secondPlayer._id, { startTimeQuestion: new Date() });
    }
    if (
      scoreData.secondPlayer.numberAnswer === countQuestions &&
      scoreData.secondPlayer.score >= 1 &&
      scoreData.firstPlayer.numberAnswer < countQuestions &&
      scoreData.firstPlayer.startTimeQuestion === null
    ) {
      await Players.findByIdAndUpdate(scoreData.secondPlayer._id, { $inc: { score: 1 } });
      await Players.findByIdAndUpdate(scoreData.firstPlayer._id, { startTimeQuestion: new Date() });
    }
  }
}
