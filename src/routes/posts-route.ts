import { Router } from 'express';
import { errorFormatter } from '../utils/error-util';
import { body, validationResult } from 'express-validator';
import basicAuth from 'express-basic-auth';
import { postsRepositoryDB } from '../repositories/posts-repository-db';
import { collections } from '../connect-db';
import { jwtService } from '../application/jwt-service';
import { commentsRepositoryDb } from '../repositories/comments-repository-db';

export const postsRouter = Router({});

postsRouter.get('/', async (req, res) => {
  const limit = parseInt(req.query?.PageSize as string) || 10;
  const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
  res.status(200).send(await postsRepositoryDB.getAllPosts(limit, pageNumber));
});

postsRouter.post(
  '/',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('title').trim().isLength({ min: 1, max: 30 }).bail().exists().withMessage('invalid title'),
  body('shortDescription')
    .trim()
    .isLength({ min: 1, max: 100 })
    .bail()
    .exists()
    .withMessage('invalid shortDescription'),
  body('content').trim().isLength({ min: 1, max: 1000 }).bail().exists().withMessage('invalid content'),
  body('bloggerId')
    .custom(async (value) => {
      return collections.bloggers?.findOne({ id: value }).then((user) => {
        if (!user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('invalid bloggerId'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const newPost = await postsRepositoryDB.createPost(req.body);
      newPost && res.status(201).send(newPost);
    }
  },
);

postsRouter.get('/:id/comments', async (req, res) => {
  const postId = req.params?.id;
  const limit = parseInt(req.query?.PageSize as string) || 10;
  const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
  const post = await postsRepositoryDB.getPostById(postId);
  if (!post) {
    res.send(404);
  } else {
    res.status(200).send(await commentsRepositoryDb.getAllComments(limit, pageNumber));
  }
});

postsRouter.post(
  '/:id/comments',
  jwtService,
  body('content').trim().isLength({ min: 20, max: 300 }).bail().exists().withMessage('invalid content'),
  async (req, res) => {
    const postId = req.params?.id;
    const post = await postsRepositoryDB.getPostById(postId);
    if (!post) {
      res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      } else {
        const newComment = await commentsRepositoryDb.createComment(req.body.content, req.user!, postId);
        newComment && res.status(201).send(newComment);
      }
    }
  },
);

postsRouter.get('/:id', async (req, res) => {
  const post = await postsRepositoryDB.getPostById(req.params.id);
  post ? res.status(200).send(post) : res.send(404);
});

postsRouter.put(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('title').trim().isLength({ min: 1, max: 30 }).bail().exists().withMessage('invalid title'),
  body('shortDescription')
    .trim()
    .isLength({ min: 1, max: 100 })
    .bail()
    .exists()
    .withMessage('invalid shortDescription'),
  body('content').trim().isLength({ min: 1, max: 1000 }).bail().exists().withMessage('invalid content'),
  body('bloggerId')
    .custom(async (value) => {
      return collections.bloggers?.findOne({ id: value }).then((user) => {
        if (!user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('invalid bloggerId'),
  async (req, res) => {
    const post = await postsRepositoryDB.getPostById(req.params?.id);
    if (!post) {
      res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      } else {
        await postsRepositoryDB.upDatePost(req.body, req.params?.id);
        res.send(204);
      }
    }
  },
);

postsRouter.delete(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  async (req, res) => {
    const post = await postsRepositoryDB.getPostById(req.params?.id);
    if (!post) {
      res.send(404);
    } else {
      await postsRepositoryDB.deletePost(req.params.id);
      res.send(204);
    }
  },
);
