import { Router } from 'express';
import 'reflect-metadata';
import { postsValidator, checkTokenService, postsController } from '../inversify.config';

export const postsRouter = Router({});

postsRouter.get(
  '/',
  checkTokenService.noBlockToken.bind(checkTokenService),
  postsController.getAllPosts.bind(postsController),
);

postsRouter.post('/', postsValidator.addPost.bind(postsValidator), postsController.addPost.bind(postsController));

postsRouter.put(
  '/:id/like-status',
  checkTokenService.accessToken.bind(checkTokenService),
  postsValidator.changeLikeStatus.bind(postsValidator),
  postsController.changeLikeStatus.bind(postsController),
);
postsRouter.get(
  '/:id/comments',
  checkTokenService.noBlockToken.bind(checkTokenService),
  postsController.getCommentByPostId.bind(postsController),
);

postsRouter.post(
  '/:id/comments',
  checkTokenService.accessToken.bind(checkTokenService),
  postsValidator.addCommentByPostId.bind(postsValidator),
  postsController.addCommentByPostId.bind(postsController),
);

postsRouter.get(
  '/:id',
  checkTokenService.noBlockToken.bind(checkTokenService),
  postsController.getPostById.bind(postsController),
);

postsRouter.put(
  '/:id',
  postsValidator.changePost.bind(postsValidator),
  postsController.changePost.bind(postsController),
);

postsRouter.delete(
  '/:id',
  postsValidator.deletePost.bind(postsValidator),
  postsController.deletePost.bind(postsController),
);
