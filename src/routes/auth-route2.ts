import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';
import { checkIpServiceUser } from '../application/check-ip-service';
import { getCurrentCollection } from '../utils/get-current-collection';

export const authRouter2 = Router({});
authRouter2.post(
  '/login',
  checkIpServiceUser,
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),

  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    const usersCollection = getCurrentCollection(req.path);
    const currentUsersIp = await usersCollection?.findOne({ userIp });
    const user = await usersRepositoryDB.getUserByLogin(req.body.login);
    // if (!currentUsersIp) {
    //   return res.send(401);
    // }
    // if (currentUsersIp!.attempt === 0) {
    //   await usersCollection?.updateOne({ userIp }, { $set: { attempt: 1 } });
    //   return res.send(401);
    // }

    if (currentUsersIp && currentUsersIp.error429 === true) {
      return res.send(429);
    }
    if (!user) {
      return res.send(401);
    }

    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
    if (isCheck === 'max limit') {
      await usersCollection?.updateOne({ userIp }, { $set: { attempt: 6 } });
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
      res.status(200).send(isCheck);
    }
  },
);

authRouter2.post(
  '/registration',
  checkIpServiceUser,
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
    const usersCollection = getCurrentCollection(req.path);
    const currentUsersIp = await usersCollection?.findOne({ userIp });
    // if (!currentUsersIp) {
    //   return res.send(204);
    // }
    // if (currentUsersIp!.attempt === 0) {
    //   await usersCollection?.updateOne({ userIp }, { $set: { attempt: 1 } });
    //   return res.send(204);
    // }
    if (currentUsersIp && currentUsersIp.error429 === true) {
      return res.send(429);
    }
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
      return res.status(204).send(isSendStatus.data);
    }
  },
);

authRouter2.post(
  '/registration-email-resending',
  checkIpServiceUser,
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
    const userIp = requestIp.getClientIp(req);
    const usersCollection = getCurrentCollection(req.path);
    const currentUsersIp = await usersCollection?.findOne({ userIp });
    // if (!currentUsersIp) {
    //   return res.send(204);
    // }
    // if (currentUsersIp!.attempt === 0) {
    //   await usersCollection?.updateOne({ userIp }, { $set: { attempt: 1 } });
    //   return res.send(204);
    // }
    if (currentUsersIp && currentUsersIp.error429 === true) {
      return res.send(429);
    }
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
      return res.send(204);
    }
    // }
  },
);

authRouter2.post(
  '/registration-confirmation',
  checkIpServiceUser,
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
    const userIp = requestIp.getClientIp(req);
    const usersCollection = getCurrentCollection(req.path);
    const currentUsersIp = await usersCollection?.findOne({ userIp });
    // if (!currentUsersIp) {
    //   return res.send(204);
    // }
    // if (currentUsersIp!.attempt === 0) {
    //   await usersCollection?.updateOne({ userIp }, { $set: { attempt: 1 } });
    //   return res.send(204);
    // }
    if (currentUsersIp && currentUsersIp.error429 === true) {
      return res.send(429);
    }
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      return res.send(204);
    }
  },
);
