import { Router } from 'express';
import { checkTokenService, quizController } from '../inversify.config';

export const quizRouter = Router({});

quizRouter.get(
  '/pairs/my-current',
  checkTokenService.accessToken.bind(checkTokenService),
  quizController.getMyCurrentPair.bind(quizController),
);
quizRouter.get(
  '/pairs/:id',
  checkTokenService.accessToken.bind(checkTokenService),
  quizController.getGameById.bind(quizController),
);
quizRouter.get(
  '/pairs/my',
  checkTokenService.accessToken.bind(checkTokenService),
  quizController.getAllUsersGames.bind(quizController),
);
quizRouter.post(
  '/pairs/connection',
  checkTokenService.accessToken.bind(checkTokenService),
  quizController.connectionToGame.bind(quizController),
);
quizRouter.post(
  '/pairs/my-current/answers',
  checkTokenService.accessToken.bind(checkTokenService),
  quizController.sendAnswer.bind(quizController),
);
quizRouter.get('/users/top', quizController.getTopUsers.bind(quizController));
