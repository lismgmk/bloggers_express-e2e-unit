import express from 'express';
import requestIp from 'request-ip';
import { collections } from '../connect-db';
import { differenceInSeconds } from 'date-fns';

export const checkIpServiceLogin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  const attemptCountUserIp = await collections.ipUsersLogin?.findOne({ userIp });
  if (!attemptCountUserIp) {
    await collections.ipUsersLogin?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    return next();
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
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit &&
    attemptCountUserIp.attempt >= attemptsLimit
  ) {
    // await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
    await collections.ipUsersLogin?.deleteOne({ userIp });
    return res.send(401);
  }

  if (
    attemptCountUserIp &&
    attemptCountUserIp.attempt < attemptsLimit
    // differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    await collections.ipUsersLogin?.find({ userIp }).forEach((doc) => {
      const oldAttemptCount = doc.attempt;
      collections.ipUsersLogin?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
    });
    return next();
  }
};
