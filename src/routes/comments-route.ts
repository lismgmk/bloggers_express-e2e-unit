import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { jwtService } from '../application/jwt-service';
import { commentsRepositoryDb } from '../repositories/comments-repository-db';

export const commentsRouter = Router({});

commentsRouter.get('/:id', async (req, res) => {
  const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
  comment ? res.status(200).send(comment) : res.send(404);
});

commentsRouter.put(
  '/:id',
  jwtService,
  body('content').trim().isLength({ min: 20, max: 300 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
    if (!comment) {
      res.send(404);
    } else {
      await commentsRepositoryDb.updateComment(req.body.content, req.user!);
      res.send(204);
    }
  },
);

commentsRouter.delete('/:id', jwtService, async (req, res) => {
  const comment = await commentsRepositoryDb.getCommentById(req.params?.id);
  if (!comment) {
    res.send(404);
  }
  const deletedComment = await commentsRepositoryDb.deleteComment(req.params?.id);
  if (deletedComment.deleteCount === 1 && deletedComment.deleteState) {
    res.send(204);
  }
});