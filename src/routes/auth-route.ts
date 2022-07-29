import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../connect-db';
import { checkIpServiceLogin } from '../application/check-Ip-service-login';
import { checkIpServiceRegistration } from '../application/check-Ip-service-registration';
import { checkIpServiceResending } from '../application/check-Ip-service-resending';
import { checkIpServiceConfirmation } from '../application/check-Ip-service-confirmation';

export const authRouter = Router({});
authRouter.post(
  '/login',
  checkIpServiceLogin,
  body('login')
    .trim()
    .isLength({ min: 3, max: 10 })
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByLogin(value).then((user) => {
        if (!user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const userIp = requestIp.getClientIp(req);
    const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
    if (isCheck === 'max limit') {
      await collections.ipUsersLogin?.updateOne({ userIp }, { $set: { attempt: 6 } });
      return res.send(429);
    }
    if (isCheck === 'add attempt') {
      res.status(400).send({
        errorsMessages: [
          {
            message: 'invalid password',
            field: 'password',
          },
        ],
      });
    } else {
      const userIp = requestIp.getClientIp(req);
      await collections.ipUsersLogin?.deleteOne({ userIp });
      res.status(200).send(isCheck);
    }
  },
);

authRouter.post(
  '/registration',
  checkIpServiceRegistration,
  body('login')
    .trim()
    .isLength({ min: 3, max: 10 })
    .bail()
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByLogin(value).then((user) => {
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
      return usersRepositoryDB.getUserByEmail(value).then((user) => {
        if (user) {
          return Promise.reject();
        }
      });
    })
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),

  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const confirmationCode = uuidv4();

    await usersRepositoryDB.createUser(req.body.login, req.body.password, req.body.email, userIp!, confirmationCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
    } else {
      const userIp = requestIp.getClientIp(req);
      await collections.ipUsersRegistration?.deleteOne({ userIp });
      return res.status(204).send(isSendStatus.data);
    }
  },
);

authRouter.post(
  '/registration-email-resending',
  checkIpServiceResending,
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByEmail(value).then((user) => {
        if (!user || user!.emailConfirmation.isConfirmed === true) {
          return Promise.reject();
        }
      });
    })
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),

  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);

    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const newCode = uuidv4();
    await usersRepositoryDB.updateCodeByEmail(req.body.email, newCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, newCode);
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
    } else {
      const userIp = requestIp.getClientIp(req);
      await collections.ipUsersResending?.deleteOne({ userIp });
      return res.send(204);
    }
    // }
  },
);

authRouter.post(
  '/registration-confirmation',
  checkIpServiceConfirmation,
  body('code')
    .exists()
    .bail()
    .custom(async (value) => {
      return authRepositoryDB.confirmEmail(value).then((user) => {
        if (!user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('code error'),

  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const userIp = requestIp.getClientIp(req);
    await collections.ipUsersResending?.deleteOne({ userIp });
    return res.send(204);
  },
);
