import basicAuth from 'express-basic-auth';
import { body } from 'express-validator';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { Bloggers } from '../models/bloggersModel';
import { myStatus } from '../types';

@injectable()
export class PostsValidator {
  addPost() {
    return [
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
    ];
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
        .withMessage('invalid like status'),
    ];
  }
  addCommentByPostId() {
    return [body('content').trim().isLength({ min: 20, max: 300 }).bail().exists().withMessage('invalid content')];
  }
  changePost() {
    return [
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
    ];
  }
  deletePost() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
    ];
  }
}
