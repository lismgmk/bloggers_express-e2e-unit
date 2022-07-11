import { Router } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { errorFormatter } from '../utils/error-util';
import { body, validationResult } from 'express-validator';
import { bloggers } from '../repositories/bloggers-repository';
import basicAuth from 'express-basic-auth';

export const postsRouter = Router({});

postsRouter.get('/', (req, res) => {
  res.status(200).send(postsRepository.getAllPosts());
});
postsRouter.post(
  '/',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('title').trim().isLength({ min: 1, max: 30 }).exists().withMessage('invalid title'),
  body('shortDescription').trim().isLength({ min: 1, max: 100 }).exists().withMessage('invalid shortDescription'),
  body('content').trim().isLength({ min: 1, max: 1000 }).exists().withMessage('invalid content'),
  body('bloggerId')
    .custom((value) => bloggers.find((el) => el.id === +value))
    .withMessage('invalid bloggerId'),
  (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    res.status(201).send(postsRepository.createPost(req.body));
  },
);

postsRouter.get('/:id', (req, res) => {
  postsRepository.getPostById(+req.params.id)
    ? res.status(200).send(postsRepository.getPostById(+req.params.id))
    : res.send(404);
});

postsRouter.put(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('title').trim().isLength({ min: 1, max: 30 }).exists().withMessage('invalid title'),
  body('shortDescription').trim().isLength({ min: 1, max: 100 }).exists().withMessage('invalid shortDescription'),
  body('content').trim().isLength({ min: 1, max: 1000 }).exists().withMessage('invalid content'),
  body('bloggerId')
    .custom((value) => bloggers.find((el) => el.id === +value))
    .withMessage('invalid bloggerId'),
  (req, res) => {
    if (!postsRepository.getPostById(+req.params?.id)) {
      res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      }
      postsRepository.upDatePost(req.body, +req.params?.id);
      res.send(204);
    }
  },
);

postsRouter.delete(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  (req, res) => {
    if (!postsRepository.getPostById(+req.params.id)) {
      res.send(404);
    } else {
      postsRepository.deletePost(+req.params.id);
      res.send(204);
    }
  },
);
