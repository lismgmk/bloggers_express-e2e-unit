import express from 'express';
import requestIp from 'request-ip';
import { collections } from '../connect-db';
import { differenceInSeconds } from 'date-fns';

export const checkIpServiceResending = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  const attemptCountUserIp = await collections.ipUsersResending?.findOne({ userIp });
  if (!attemptCountUserIp) {
    await collections.ipUsersResending?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    return next();
  }
  if (attemptCountUserIp && differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit) {
    // await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
    await collections.ipUsersResending?.deleteOne({ userIp });
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
    await collections.ipUsersResending?.find({ userIp }).forEach((doc) => {
      const oldAttemptCount = doc.attempt;
      collections.ipUsersResending?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
    });
    return next();
  }
};
