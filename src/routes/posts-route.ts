import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { checkAccessTokenService } from '../application/check-access-token-service';
import { noBlockCheckAccessService } from '../application/noBlock-check-access-token-service';
import { collections } from '../connect-db';
import { Bloggers } from '../models/bloggersModel';
import { commentsRepositoryDb } from '../repositories/comments-repository-db';
import { likesRepositoryDB } from '../repositories/likes-repository-db';
import { postsRepositoryDB } from '../repositories/posts-repository-db';
import { myStatus } from '../types';
import { errorFormatter } from '../utils/error-util';
import { userStatusUtil } from '../utils/user-status-util';

export const postsRouter = Router({});

postsRouter.get('/', noBlockCheckAccessService, async (req, res) => {
  const limit = parseInt(req.query?.PageSize as string) || 10;
  const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
  res.status(200).send(await postsRepositoryDB.getAllPosts(limit, pageNumber, req.user || null));
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
      const user = await Bloggers.findById(value);
      if (!user) {
        return Promise.reject();
      }
    })
    .withMessage('invalid bloggerId'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const newPost = await postsRepositoryDB.createPost(req.body);
      if (typeof newPost === 'string') {
        res.status(430).send(newPost);
      } else {
        res.status(201).send(newPost);
      }
    }
  },
);

postsRouter.put(
  '/:id/like-status',
  checkAccessTokenService,
  body('likeStatus')
    .custom(async (value) => {
      const keys = Object.keys(myStatus);
      if (!keys.includes(value)) {
        return Promise.reject();
      }
    })
    .withMessage('invalid bloggerId'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    const postId = req.params!.id;
    const post = await postsRepositoryDB.checkPostById(postId);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (!post) {
      return res.send(404);
    } else {
      const updatedPost = await likesRepositoryDB.upDateLikesInfo(
        postId,
        req.body.likeStatus,
        req.user!._id!,
        req.user!.accountData.userName,
      );
      if (typeof updatedPost === 'string') {
        res.status(430).send(updatedPost);
      } else {
        res.send(204);
      }
    }
  },
);
postsRouter.get('/:id/comments', async (req, res) => {
  const postId = req.params?.id;
  const limit = parseInt(req.query?.PageSize as string) || 10;
  const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
  const post = await postsRepositoryDB.checkPostById(postId);
  if (!post) {
    res.send(404);
  } else {
    res.status(200).send(await commentsRepositoryDb.getAllComments(limit, pageNumber, postId));
  }
});

postsRouter.post(
  '/:id/comments',
  checkAccessTokenService,
  body('content').trim().isLength({ min: 20, max: 300 }).bail().exists().withMessage('invalid content'),
  async (req, res) => {
    const postId = req.params?.id;
    const post = await postsRepositoryDB.checkPostById(postId);
    if (!post) {
      res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      } else {
        const userObjectId = new mongoose.Types.ObjectId(req.user!._id!);
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const newComment = await commentsRepositoryDb.createComment(req.body.content, userObjectId, postObjectId);
        newComment && res.status(201).send(newComment);
      }
    }
  },
);

postsRouter.get('/:id', noBlockCheckAccessService, async (req, res) => {
  const userStatus = await userStatusUtil(req.params.id, req.user || null);
  const post = await postsRepositoryDB.getPostById(req.params.id, userStatus);
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
    const post = await postsRepositoryDB.checkPostById(req.params?.id);
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
    const post = await postsRepositoryDB.checkPostById(req.params?.id);
    if (!post) {
      res.send(404);
    } else {
      await postsRepositoryDB.deletePost(req.params.id);
      res.send(204);
    }
  },
);
