import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../connect-db';
import { differenceInSeconds } from 'date-fns';

export const authRouter = Router({});
const secondsLimit = 10;
const attemptsLimit = 5;
authRouter.post(
  '/login',
  // checkIpServiceLogin,
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),

  async (req, res) => {
    // const result = validationResult(req).formatWith(errorFormatter);
    // if (!result.isEmpty()) {
    //   await addUserAttempt.addAttemptByLogin(req.body.login, false);
    //   return res.status(400).send({ errorsMessages: result.array() });
    // }
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
    if (!attemptCountUserIp) {
      await collections.ipUsers?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt < attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      await collections.ipUsers?.find({ userIp }).forEach((doc) => {
        const oldAttemptCount = doc.attempt;
        collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
      });
    }

    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
      await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 0, createdAt: new Date() } });
      return res.send(401);
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt >= attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      return res.send(429);
    }

    const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
    if (isCheck === 'max limit') {
      return res.send(429);
    } else {
      if (isCheck === 'add attempt') {
        res.send(401);
      } else {
        const userIp = requestIp.getClientIp(req);
        await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 0 } });
        res.status(200).send(isCheck);
      }
    }
  },
);

authRouter.post(
  '/registration',
  // checkIpService,
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
    const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
    if (!attemptCountUserIp) {
      await collections.ipUsers?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt < attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      await collections.ipUsers?.find({ userIp }).forEach((doc) => {
        const oldAttemptCount = doc.attempt;
        collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
      });
    }
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
      // await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
      await collections.ipUsers?.deleteOne({ userIp });
      // return res.send(401);
      const confirmationCode = uuidv4();

      await usersRepositoryDB.createUser(req.body.login, req.body.password, req.body.email, userIp!, confirmationCode);
      const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
      if (isSendStatus.error) {
        const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
        return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
      } else {
        const userIp = requestIp.getClientIp(req);
        await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 0 } });
        return res.status(204).send(isSendStatus.data);
      }
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt > attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      return res.send(429);
    }
    const confirmationCode = uuidv4();

    await usersRepositoryDB.createUser(req.body.login, req.body.password, req.body.email, userIp!, confirmationCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
    } else {
      const userIp = requestIp.getClientIp(req);
      await collections.ipUsers?.deleteOne({ userIp });
      return res.status(204).send(isSendStatus.data);
    }
  },
);

authRouter.post(
  '/registration-email-resending',
  // checkIpService,
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
    // const result = validationResult(req).formatWith(errorFormatter);
    // if (!result.isEmpty()) {
    //   return res.status(400).send({ errorsMessages: result.array() });
    // }
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
    if (!attemptCountUserIp) {
      await collections.ipUsers?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt < attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      await collections.ipUsers?.find({ userIp }).forEach((doc) => {
        const oldAttemptCount = doc.attempt;
        collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
      });
    }

    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
      await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
      // return res.send(401);
      const newCode = uuidv4();
      await usersRepositoryDB.updateCodeByEmail(req.body.email, newCode);
      const isSendStatus = await mailService.sendEmail(req.body.email, newCode);
      if (isSendStatus.error) {
        const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
        return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
      } else {
        const userIp = requestIp.getClientIp(req);
        await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 0 } });
        return res.send(204);
      }
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt > attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      return res.send(429);
    } else {
      const newCode = uuidv4();
      await usersRepositoryDB.updateCodeByEmail(req.body.email, newCode);
      const isSendStatus = await mailService.sendEmail(req.body.email, newCode);
      if (isSendStatus.error) {
        const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
        return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
      } else {
        const userIp = requestIp.getClientIp(req);
        await collections.ipUsers?.deleteOne({ userIp });
        return res.send(204);
      }
    }
  },
);

authRouter.post(
  '/registration-confirmation',
  // checkIpService,
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
    // const result = validationResult(req).formatWith(errorFormatter);
    // if (!result.isEmpty()) {
    //   return res.status(400).send({ errorsMessages: result.array() });
    // }
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
    if (!attemptCountUserIp) {
      await collections.ipUsers?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt < attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      await collections.ipUsers?.find({ userIp }).forEach((doc) => {
        const oldAttemptCount = doc.attempt;
        collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
      });
    }
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
      await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
      // return res.send(401);
      await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 0 } });
      return res.send(204);
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt > attemptsLimit &&
      differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
    ) {
      return res.send(429);
    } else {
      const userIp = requestIp.getClientIp(req);
      await collections.ipUsers?.deleteOne({ userIp });
      return res.send(204);
    }
  },
);
