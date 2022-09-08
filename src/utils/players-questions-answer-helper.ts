import { injectable } from 'inversify';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { IQuestionSchema, Questions } from '../models/questionsModel';
import { quizQuestions } from '../variables';

@injectable()
export class PlayersQuestionsAnswersHelper {
  answerItem(questions: IQuestionSchema[]) {
    return questions.map((el) => {
      return { questionId: el._id, answerStatus: null, addedAt: null, body: el.body, correctAnswer: el.correctAnswer };
    });
  }

  async createQuestions() {
    const fiveRandomQuestions = _.sampleSize(quizQuestions, 5);
    return await Promise.all(
      fiveRandomQuestions.map(async (el) => {
        const questionId = new ObjectId();
        const newQuestion = new Questions({ _id: questionId, body: el.body, correctAnswer: el.correctAnswer });
        const question = await Questions.create(newQuestion);
        return question;
      }),
    );
  }
}
