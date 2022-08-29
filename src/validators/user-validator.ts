import 'reflect-metadata';
import basicAuth from 'express-basic-auth';
import { body } from 'express-validator';
import { injectable } from 'inversify';

@injectable()
export class UserValidator {
  createUser() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
      body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
      body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
      body('email')
        .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .exists()
        .withMessage(
          "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
        ),
    ];
  }

  deleteUser() {
    return [
      basicAuth({
        users: { admin: 'qwerty' },
      }),
    ];
  }
}
