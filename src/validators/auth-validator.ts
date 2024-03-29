import { body } from 'express-validator';
import { inject } from 'inversify';
import { AuthRepositoryDB } from '../repositories/auth-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { JwtPassService } from '../utils/jwt-pass-service';

class AuthValidator {
  constructor(
    @inject(AuthRepositoryDB) protected authRepositoryDB: AuthRepositoryDB,
    @inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB,
  ) {}
  login() {
    return [
      body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
      body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
    ];
  }

  registration() {
    return [
      body('login')
        .trim()
        .isLength({ min: 3, max: 10 })
        .bail()
        .exists()
        .bail()
        .custom(async (value) => {
          return this.usersRepositoryDB.getUserByLogin(value).then((user) => {
            if (user) {
              return Promise.reject();
            }
          });
        })
        .withMessage('invalid value'),

      body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
      body('email')
        .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .exists()
        .bail()
        .custom(async (value) => {
          return this.usersRepositoryDB.getUserByEmail(value).then((user) => {
            if (user) {
              return Promise.reject();
            }
          });
        })
        .withMessage(
          "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
        ),
    ];
  }

  registrationEmailResending() {
    return [
      body('email')
        .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
        .exists()
        .bail()
        .custom(async (value) => {
          const user = await this.usersRepositoryDB.getUserByEmail(value);
          if (!user || user.emailConfirmation.isConfirmed === true) {
            return Promise.reject();
          }
        })
        .withMessage(
          "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
        ),
    ];
  }
  registrationConfirmation() {
    return [
      body('code')
        .exists()
        .bail()
        .custom(async (value) => {
          return this.authRepositoryDB.confirmEmail(value).then((user) => {
            if (!user) {
              return Promise.reject();
            }
          });
        })
        .withMessage('code error'),
    ];
  }
}
export const authValidator = new AuthValidator(
  new AuthRepositoryDB(new UsersRepositoryDB(), new JwtPassService()),
  new UsersRepositoryDB(),
);
