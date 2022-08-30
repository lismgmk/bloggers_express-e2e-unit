import { Router } from 'express';
import { bloggersValidator, checkTokenService, bloggersController } from '../inversify.config';

export const bloggersRouter = Router({});

bloggersRouter.get('/', bloggersController.getAllBloggers.bind(bloggersController));

bloggersRouter.post(
  '/',
  bloggersValidator.addBlogger.bind(bloggersValidator),
  bloggersController.addBlogger.bind(bloggersController),
);

bloggersRouter.get('/:id', bloggersController.getBloggerById.bind(bloggersController));

bloggersRouter.get(
  '/:bloggerId/posts',
  checkTokenService.noBlockToken.bind(checkTokenService),
  bloggersController.getPostsForBloggerId.bind(bloggersController),
);

bloggersRouter.post(
  '/:bloggerId/posts',
  bloggersValidator.changePostsForBlogger.bind(bloggersValidator),
  bloggersController.changePostsForBloggerId.bind(bloggersController),
);

bloggersRouter.put(
  '/:id',
  bloggersValidator.changeBlogger.bind(bloggersValidator),
  bloggersController.changeBlogger.bind(bloggersController),
);

bloggersRouter.delete(
  '/:id',
  bloggersValidator.deleteBlogger.bind(bloggersValidator),
  bloggersController.deleteBlogger.bind(bloggersController),
);
