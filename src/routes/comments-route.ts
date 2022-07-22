import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { jwtService } from '../application/jwt-service';
import { commentsRepositoryDb } from '../repositories/comments-repository-db';
import { ObjectId } from 'mongodb';

export const commentsRouter = Router({});

commentsRouter.get('/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.send(404);
  } else {
    const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
    comment ? res.status(200).send(comment) : res.send(404);
  }
});

commentsRouter.put(
  '/:id',
  jwtService,
  body('content').trim().isLength({ min: 20, max: 300 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      if (!ObjectId.isValid(req.params.id)) {
        return res.send(404);
      } else {
        const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
        if (!comment) {
          res.send(404);
        } else if (comment.userId !== req.user) {
          res.sendStatus(403);
        } else {
          await commentsRepositoryDb.updateComment(req.body.content, req.params?.id);
          res.send(204);
        }
      }
    }
  },
);

commentsRouter.delete('/:id', jwtService, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.send(404);
  } else {
    const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
    if (!comment) {
      res.sendStatus(404);
    } else if (comment.userId !== req.user) {
      res.sendStatus(403);
    } else {
      const deletedComment = await commentsRepositoryDb.deleteComment(req.params?.id);
      if (deletedComment.deleteCount === 1 && deletedComment.deleteState) {
        res.send(204);
      }
    }
  }
});
