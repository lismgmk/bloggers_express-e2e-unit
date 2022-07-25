import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';

export const authRouter = Router({});

authRouter.post(
  '/login',
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(401).send({ errorsMessages: result.array() });
    } else {
      const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
      if (isCheck === 'error') {
        res.send(401);
      } else {
        res.status(200).send(isCheck);
      }
    }
  },
);

authRouter.post(
  '/registration',
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
    const confirmationCode = uuidv4();
    const clientIp = requestIp.getClientIp(req);
    const newUser = await usersRepositoryDB.createUser(
      req.body.login,
      req.body.password,
      req.body.email,
      clientIp!,
      confirmationCode,
    );
    if (newUser === 'max limit') {
      return res.status(429).send('More than 5 registration attempts from one IP-address during 10 seconds');
    }
    if (newUser === 'add attempt') {
      return res.status(400).send('this user is already exist');
    } else {
      const isSendStatus = await mailService.sendEmail(req.body.email, req.body.password, confirmationCode);
      if (!isSendStatus.error) {
        return res.status(204).send(isSendStatus.data);
      }
      if (isSendStatus.error) {
        const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
        return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
      }
    }
  },
);

authRouter.post(
  '/registration-email-resending',
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
      return;
    }
  },
);

authRouter.post('/registration-confirmation', body('code').exists().withMessage('code error'), async (req, res) => {
  const result = validationResult(req).formatWith(errorFormatter);
  if (!result.isEmpty()) {
    return res.status(401).send({ errorsMessages: result.array() });
  } else {
    const authConfirm = await authRepositoryDB.confirmEmail(req.body.code);
    if (authConfirm) {
      return res.send(204);
    }
  }
});
