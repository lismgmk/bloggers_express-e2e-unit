import { injectable } from 'inversify';
import { IQuestionSchema, Questions } from '../models/questionsModel';

@injectable()
export class QuestionsRepositoryDB {
  async createQuestion(questionData: { body: string; correctAnswer: string }): Promise<IQuestionSchema | string> {
    const newQuestion = new Questions(questionData);
    try {
      await Questions.create(newQuestion);
      return newQuestion;
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
