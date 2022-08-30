import { Router } from 'express';
import { commentsValidator, checkTokenService, commentsController } from '../inversify.config';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  checkTokenService.noBlockToken.bind(checkTokenService),
  commentsController.getCommentById.bind(commentsController),
);

commentsRouter.put(
  '/:id',
  checkTokenService.accessToken.bind(checkTokenService),
  commentsValidator.changeComment.bind(commentsValidator),
  commentsController.changeComment.bind(commentsController),
);

commentsRouter.delete(
  '/:id',
  checkTokenService.accessToken.bind(checkTokenService),
  commentsController.deleteComment.bind(commentsController),
);

commentsRouter.put(
  '/:id/like-status',
  checkTokenService.accessToken.bind(checkTokenService),
  commentsValidator.changeLikeStatus.bind(commentsValidator),
  commentsController.changeLikeStatus.bind(commentsController),
);
