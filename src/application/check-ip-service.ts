import express from 'express';
import requestIp from 'request-ip';
import { collections } from '../connect-db';
import { differenceInSeconds } from 'date-fns';

export const checkIpServiceUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secondsLimit = 10;
  const attemptsLimit = 4;
  const userIp = requestIp.getClientIp(req);
  const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
  if (!attemptCountUserIp) {
    await collections.ipUsers?.insertOne({
      createdAt: new Date(),
      userIp,
      attempt: 1,
      error429: false,
    });
    return next();
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
    return next();
  }
  if (
    attemptCountUserIp &&
    attemptCountUserIp!.attempt >= attemptsLimit &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    await collections.ipUsers?.updateOne({ userIp }, { $set: { error429: true } });
    return next();
  }

  if (
    attemptCountUserIp &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit &&
    attemptCountUserIp!.error429 === true
  ) {
    await collections.ipUsers?.deleteOne({ userIp });
    return next();
  }
  if (
    attemptCountUserIp &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit &&
    attemptCountUserIp!.error429 === false
  ) {
    await collections.ipUsers?.updateOne({ userIp }, { $set: { createdAt: new Date(), attempt: 0 } });
    return next();
  } else {
    return next();
  }
};
