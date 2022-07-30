import express from 'express';
import requestIp from 'request-ip';
import { collections } from '../connect-db';
import { differenceInSeconds } from 'date-fns';

export const checkIpServiceRegistration2 = {
  async findUserByIp(userIp: string) {
    return await collections.ipUsersRegistration?.findOne({ userIp });
  },
  async addUser(userIp: string) {
    return await collections.ipUsersRegistration?.insertOne({
      createdAt: new Date(),
      userIp,
      attempt: 1,
      error429: false,
    });
  },
  async deleteUser(userIp: string) {
    return await collections.ipUsersRegistration?.deleteOne({ userIp });
  },
  async addAttemptUser(userIp: string) {
    return await collections.ipUsersRegistration?.find({ userIp }).forEach((doc) => {
      const oldAttemptCount = doc.attempt;
      collections.ipUsersRegistration?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
    });
  },
  async addError429User(userIp: string) {
    return await collections.ipUsersRegistration?.updateOne({ userIp }, { $set: { error429: true } });
  },
};

export const checkIpServiceRegistration = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  const attemptCountUserIp = await collections.ipUsersRegistration?.findOne({ userIp });
  if (!attemptCountUserIp) {
    await collections.ipUsersRegistration?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    return next();
  }
  if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
    // await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
    await collections.ipUsersRegistration?.deleteOne({ userIp });
    // return next();
    return res.send(204);
  }
  if (
    attemptCountUserIp &&
    attemptCountUserIp.attempt >= attemptsLimit &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    return res.send(429);
  }

  if (
    attemptCountUserIp &&
    attemptCountUserIp.attempt < attemptsLimit &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    await collections.ipUsersRegistration?.find({ userIp }).forEach((doc) => {
      const oldAttemptCount = doc.attempt;
      collections.ipUsersRegistration?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
    });
    return next();
  }
};
