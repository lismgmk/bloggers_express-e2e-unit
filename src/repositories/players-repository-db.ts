import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import { Players, IPlayersSchema } from '../models/playersModel';
import { IQuestionSchema } from '../models/questionsModel';
import { IResPlayer } from '../types';
import { PlayersQuestionsAnswersHelper } from '../utils/players-questions-answer-helper';

@injectable()
export class PlayersRepositoryDB {
  constructor(
    @inject(PlayersQuestionsAnswersHelper) protected playersQuestionsAnswersHelper: PlayersQuestionsAnswersHelper,
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
      });
      await Players.create(newPlayer);
      return newPlayer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async findPlayerByUserId(userId: ObjectId): Promise<IPlayersSchema | string | null> {
    try {
      const player = await Players.find({ userId }).lean();
      return player[0];
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async setAnswerPlayer(answerData: {
    playerId: ObjectId;
    answer: string;
    numberQuestion: number;
  }): Promise<Partial<IResPlayer> | string> {
    try {
      let resPlayer: Partial<IResPlayer> = {};
      const player = await Players.findById(answerData.playerId);
      const currentAnswer = player!.answers![answerData.numberQuestion];
      if (answerData.answer === currentAnswer!.correctAnswer) {
        currentAnswer.answerStatus = 'Correct';
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
      // await Players.findById(answerData.playerId)
      //   .then(
      //     (player: (Document<unknown, any, IPlayersSchema> & IPlayersSchema & Required<{ _id: ObjectId }>) | null) => {
      //       const currentAnswer = player!.answers![answerData.numberQuestion];
      //       if (answerData.answer === currentAnswer!.correctAnswer) {
      //         currentAnswer.answerStatus = 'Correct';
      //       } else {
      //         currentAnswer.answerStatus = 'Incorrect';
      //       }
      //       currentAnswer.addedAt = new Date();
      //       resPlayer = {
      //         questionId: new ObjectId(currentAnswer.questionId),
      //         answerStatus: currentAnswer.answerStatus,
      //         addedAt: currentAnswer.addedAt,
      //       };
      //       return player!.save();
      //     },
      //   )
      //   .catch((e) => console.log(e, 'error!!!!!!'));
      return resPlayer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
