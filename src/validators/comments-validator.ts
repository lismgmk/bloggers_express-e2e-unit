import { body } from 'express-validator';
import 'reflect-metadata';
import { myStatus } from '../types';

// @injectable()
class CommentsValidator {
  changeComment() {
    return [body('content').trim().isLength({ min: 20, max: 300 }).exists().withMessage('invalid length')];
  }

  changeLikeStatus() {
    return [
      body('likeStatus')
        .custom(async (value) => {
          const keys = Object.keys(myStatus);
          if (!keys.includes(value)) {
            return Promise.reject();
          }
        })
        .withMessage('invalid bloggerId'),
    ];
  }
}

export const commentsValidator = new CommentsValidator();
