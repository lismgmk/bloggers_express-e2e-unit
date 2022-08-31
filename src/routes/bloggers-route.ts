import { Router } from 'express';
import { checkTokenService, bloggersController } from '../inversify.config';
import { bloggersValidator } from '../validators/bloggers-validator';

export const bloggersRouter = Router({});

bloggersRouter.get('/', bloggersController.getAllBloggers.bind(bloggersController));

bloggersRouter.post('/', bloggersValidator.addBlogger(), bloggersController.addBlogger.bind(bloggersController));

bloggersRouter.get('/:id', bloggersController.getBloggerById.bind(bloggersController));

bloggersRouter.get(
  '/:bloggerId/posts',
  checkTokenService.noBlockToken.bind(checkTokenService),
  bloggersController.getPostsForBloggerId.bind(bloggersController),
);

bloggersRouter.post(
  '/:bloggerId/posts',
  bloggersValidator.changePostsForBlogger(),
  bloggersController.changePostsForBloggerId.bind(bloggersController),
);

bloggersRouter.put(
  '/:id',
  bloggersValidator.changeBlogger(),
  bloggersController.changeBlogger.bind(bloggersController),
);

bloggersRouter.delete(
  '/:id',
  bloggersValidator.deleteBlogger(),
  bloggersController.deleteBlogger.bind(bloggersController),
);
