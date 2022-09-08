import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { IAnswerSchema, Answers } from '../models/answersModel';
import { IAnswerStatus } from '../types';

@injectable()
export class AnswersRepositoryDB {
  async createAnswer(answerData: {
    questionId: ObjectId;
    answerStatus: IAnswerStatus;
    userId: ObjectId;
    numberQuestion: number;
  }): Promise<IAnswerSchema | string> {
    const newAnswer = new Answers({
      ...answerData,
      addedAt: new Date(),
    });
    try {
      await Answers.create(newAnswer);
      return newAnswer;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
