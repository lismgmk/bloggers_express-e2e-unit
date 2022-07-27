import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';
import { addUserAttempt } from '../utils/add-user-attempt';
import { checkIpService } from '../application/check-Ip-service';

export const authRouter = Router({});

authRouter.post(
  '/login',
  checkIpService,
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      await addUserAttempt.addAttemptByLogin(req.body.login, false);
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
    if (isCheck === 'max limit') {
      return res.send(429);
    } else {
      if (isCheck === 'add attempt') {
        res.send(401);
      } else {
        res.status(200).send(isCheck);
      }
    }
  },
);

authRouter.post(
  '/registration',
  checkIpService,
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const clientIp = requestIp.getClientIp(req);
    const confirmationCode = uuidv4();

    await usersRepositoryDB.createUser(req.body.login, req.body.password, req.body.email, clientIp!, confirmationCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
    if (!isSendStatus.error) {
      return res.status(204).send(isSendStatus.data);
    }
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
      // }
    }
  },
);

authRouter.post(
  '/registration-email-resending',
  checkIpService,
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(401).send({ errorsMessages: result.array() });
    } else {
      const confirmationCode = await usersRepositoryDB.getUserByEmail(req.body.email);
      if (confirmationCode) {
        const isSendStatus = await mailService.sendEmail(
          req.body.email,
          confirmationCode.emailConfirmation.confirmationCode,
        );
        if (!isSendStatus.error) {
          return res.status(204).send(isSendStatus.data);
        }
        if (isSendStatus.error) {
          const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
          return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
        }
        return res.send(204);
      } else {
        res.send(404);
      }
    }
  },
);

authRouter.post(
  '/registration-confirmation',
  checkIpService,
  body('code').exists().withMessage('code error'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const authConfirm = await authRepositoryDB.confirmEmail(req.body.code);
      if (authConfirm) {
        return res.send(204);
      } else {
        return res.status(400).send('incorrect code');
      }
    }
  },
);
