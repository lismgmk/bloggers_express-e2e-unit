import { Router } from 'express';
import { checkTokenService, postsController } from '../inversify.config';
import { postsValidator } from '../validators/posts-validator';

export const postsRouter = Router({});

postsRouter.get(
  '/',
  checkTokenService.noBlockToken.bind(checkTokenService),
  postsController.getAllPosts.bind(postsController),
);

postsRouter.post('/', postsValidator.addPost(), postsController.addPost.bind(postsController));

postsRouter.put(
  '/:id/like-status',
  checkTokenService.accessToken.bind(checkTokenService),
  postsValidator.changeLikeStatus(),
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
  postsValidator.addCommentByPostId(),
  postsController.addCommentByPostId.bind(postsController),
);

postsRouter.get(
  '/:id',
  checkTokenService.noBlockToken.bind(checkTokenService),
  postsController.getPostById.bind(postsController),
);

postsRouter.put('/:id', postsValidator.changePost(), postsController.changePost.bind(postsController));

postsRouter.delete('/:id', postsValidator.deletePost(), postsController.deletePost.bind(postsController));
