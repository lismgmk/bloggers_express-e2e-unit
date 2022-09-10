import express from 'express';
import { QuizService, QuestionsAmount } from './quiz-service';

describe('test quiz service', function () {
  describe('test ipStatus method', () => {
    const countQuestionLimit = 1;

    it('should not call next when attempt enter >= limit attempt for login path', async () => {
      let statusResp = 0;

      const mockQuestionsAmount = {
        get CONST_QUESTIONS() {
          return countQuestionLimit;
        },
      } as QuestionsAmount;
      const quizService = new QuizService(mockQuestionsAmount);

      const mockResponse = {
        status: (code) => {
          statusResp = code;
          return {} as express.Response;
        },
      } as express.Response;
      const req = {} as express.Request;
      const next = jest.fn() as express.NextFunction;

      await quizService.countRequest(req, mockResponse, next);

      expect(next).toBeCalledTimes(1);

      await quizService.countRequest(req, mockResponse, next);
      expect(statusResp).toBe(403);
      // const allUsers1 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });
      //
      // expect(allUsers1.length).toBe(1);
      // expect(next).toBeCalledTimes(1);
      // await testCheckIpServiceUser.ipStatus(req, res, next);
      // const allUsers2 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });
      // expect(next).toBeCalledTimes(1);
      // expect(allUsers2.length).toBe(1);
    });
  });
});
