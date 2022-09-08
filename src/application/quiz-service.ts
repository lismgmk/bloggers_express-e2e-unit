import express from 'express';
import { injectable, inject } from 'inversify';

@injectable()
export class QuestionsAmount {
  public get CONST_QUESTIONS() {
    return 5;
  }
}

@injectable()
export class QuizService {
  private count;
  constructor(@inject(QuestionsAmount) protected questionsAmount: QuestionsAmount) {
    this.count = 0;
  }

  async countRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (this.count >= this.questionsAmount.CONST_QUESTIONS) {
      req.countRequest = 'end';
    } else {
      req.countRequest = this.count;
      this.count += 1;
    }
    return next();
  }
}
