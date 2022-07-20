import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import basicAuth from 'express-basic-auth';
import { bloggersRepositoryDB } from '../repositories/bloggers-repository-db';

export const commentsRouter = Router({});

commentsRouter.get('/:id', async (req, res) => {
  const commentId = parseInt(req.params.id);
  // const blogger = await commentsRepositoryDB.getCommentById(commentId);
  const blogger: never[] = [];
  if (!blogger) {
    res.status(404).send('Not found');
  } else {
    res.status(200).send(blogger);
  }
});

commentsRouter.put(
  '/:id',
  body('content').trim().isLength({ min: 20, max: 300 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const blogger = await bloggersRepositoryDB.getBloggerById(+req.params?.id);
    if (!blogger) {
      res.send(404);
    } else {
      await bloggersRepositoryDB.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params?.id);
      res.send(204);
    }
  },
);

commentsRouter.delete(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  async (req, res) => {
    const blogger = await bloggersRepositoryDB.getBloggerById(+req.params?.id);
    if (!blogger) {
      res.send(404);
    }
    const deletedBlogger = await bloggersRepositoryDB.deleteBlogger(+req.params.id);
    if (deletedBlogger.deleteCount === 1 && deletedBlogger.deleteState) {
      res.send(204);
    }
  },
);
