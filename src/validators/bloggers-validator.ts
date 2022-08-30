import basicAuth from 'express-basic-auth';
import { body } from 'express-validator';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class BloggersValidator {
  addBlogger() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
      body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
      body('youtubeUrl')
        .isLength({ min: 1, max: 100 })
        .bail()
        .exists()
        .bail()
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage('invalid url'),
    ];
  }

  changePostsForBlogger() {
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
    ];
  }

  changeBlogger() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
      body('name').trim().isLength({ min: 1, max: 15 }).exists().withMessage('invalid length'),
      body('youtubeUrl')
        .isLength({ min: 1, max: 100 })
        .bail()
        .exists()
        .bail()
        .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
        .withMessage('invalid url'),
    ];
  }

  deleteBlogger() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
    ];
  }
}
