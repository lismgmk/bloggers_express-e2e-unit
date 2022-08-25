import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { checkAccessTokenService } from '../application/check-access-token-service';
import { noBlockCheckAccessService } from '../application/noBlock-check-access-token-service';
import { commentsRepositoryDb } from '../repositories/comments-repository-db';
import { likesRepositoryDB } from '../repositories/likes-repository-db';
import { myStatus } from '../types';
import { errorFormatter } from '../utils/error-util';
import { userStatusUtil } from '../utils/user-status-util';

export const commentsRouter = Router({});

commentsRouter.get('/:id', noBlockCheckAccessService, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.send(404);
  } else {
    const userStatus = await userStatusUtil(null, req.params.id, req.user || null);
    const comment = await commentsRepositoryDb.getCommentById(req.params?.id, userStatus);
    comment ? res.status(200).send(comment) : res.send(404);
  }
});

commentsRouter.put(
  '/:id',
  checkAccessTokenService,
  body('content').trim().isLength({ min: 20, max: 300 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      if (!ObjectId.isValid(req.params.id)) {
        return res.send(404);
      } else {
        const comment = await commentsRepositoryDb.checkCommentById(req.params?.id);
        if (!comment) {
          res.send(404);
        } else if (!comment!.userId!.equals(req.user!._id!)) {
          res.status(400).send('The comment does not belong to the current login user');
        } else {
          const updatedComment = await commentsRepositoryDb.updateComment(req.body.content, req.params?.id);
          if (typeof updatedComment === 'string') {
            res.status(430).send(updatedComment);
          } else {
            res.send(204);
          }
        }
      }
    }
  },
);

commentsRouter.delete('/:id', checkAccessTokenService, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.send(404);
  } else {
    const comment = await commentsRepositoryDb.checkCommentById(req.params?.id);
    if (!comment) {
      res.sendStatus(404);
    } else if (!comment!.userId!.equals(req.user!._id!)) {
      res.status(403).send('The comment does not belong to the current login user');
    } else {
      const deletedComment = await commentsRepositoryDb.deleteComment(req.params?.id);
      if (typeof deletedComment === 'string') {
        res.status(430).send(deletedComment);
      } else {
        res.send(204);
      }
    }
  }
});

commentsRouter.put(
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
    const commentId = req.params!.id;
    const comment = await commentsRepositoryDb.checkCommentById(commentId);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (!comment) {
      return res.send(404);
    } else {
      const updatedPost = await likesRepositoryDB.upDateLikesInfo(
        null,
        commentId,
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
