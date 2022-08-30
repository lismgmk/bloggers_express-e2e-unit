import express from 'express';
import { validationResult } from 'express-validator';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import 'reflect-metadata';
import { CommentsRepositoryDb } from '../repositories/comments-repository-db';
import { LikesRepositoryDB } from '../repositories/likes-repository-db';
import { errorFormatter } from '../utils/error-util';
import { userStatusUtil } from '../utils/user-status-util';

@injectable()
export class CommentsController {
  constructor(
    @inject(CommentsRepositoryDb) protected commentsRepositoryDb: CommentsRepositoryDb,
    @inject(LikesRepositoryDB) protected likesRepositoryDB: LikesRepositoryDB,
  ) {}
  async getCommentById(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const userStatus = await userStatusUtil(null, req.params.id, req.user || null);
      const comment = await this.commentsRepositoryDb.getCommentById(req.params?.id, userStatus);
      comment ? res.status(200).send(comment) : res.send(404);
    }
  }

  async changeComment(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      if (!ObjectId.isValid(req.params.id)) {
        return res.send(404);
      } else {
        const comment = await this.commentsRepositoryDb.checkCommentById(req.params?.id);
        if (!comment) {
          res.send(404);
        } else if (!comment!.userId!.equals(req.user!._id!)) {
          res.status(400).send('The comment does not belong to the current login user');
        } else {
          const updatedComment = await this.commentsRepositoryDb.updateComment(req.body.content, req.params?.id);
          if (typeof updatedComment === 'string') {
            res.status(430).send(updatedComment);
          } else {
            res.send(204);
          }
        }
      }
    }
  }

  async deleteComment(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const comment = await this.commentsRepositoryDb.checkCommentById(req.params?.id);
      if (!comment) {
        res.sendStatus(404);
      } else if (!comment!.userId!.equals(req.user!._id!)) {
        res.status(403).send('The comment does not belong to the current login user');
      } else {
        const deletedComment = await this.commentsRepositoryDb.deleteComment(req.params?.id);
        if (typeof deletedComment === 'string') {
          res.status(430).send(deletedComment);
        } else {
          res.send(204);
        }
      }
    }
  }

  async changeLikeStatus(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params!.id)) {
      return res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      const commentId = req.params!.id;
      const comment = await this.commentsRepositoryDb.checkCommentById(commentId);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      }
      if (!comment) {
        return res.send(404);
      } else {
        const updatedPost = await this.likesRepositoryDB.upDateLikesInfo(
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
    }
  }
}
