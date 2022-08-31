import { Router } from 'express';
import { checkTokenService, commentsController } from '../inversify.config';
import { commentsValidator } from '../validators/comments-validator';

export const commentsRouter = Router({});

commentsRouter.get(
  '/:id',
  checkTokenService.noBlockToken.bind(checkTokenService),
  commentsController.getCommentById.bind(commentsController),
);

commentsRouter.put(
  '/:id',
  checkTokenService.accessToken.bind(checkTokenService),
  commentsValidator.changeComment(),
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
  commentsValidator.changeLikeStatus(),
  commentsController.changeLikeStatus.bind(commentsController),
);
