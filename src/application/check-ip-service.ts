import express from 'express';
import requestIp from 'request-ip';
import { differenceInSeconds } from 'date-fns';
import { getCurrentCollection } from '../utils/get-current-collection';

export const checkIpServiceUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const usersCollection = getCurrentCollection(req.path);

  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  const attemptCountUserIp = await usersCollection?.findOne({ userIp });
  console.log(attemptCountUserIp, 'collection');

  if (!attemptCountUserIp) {
    await usersCollection?.insertOne({
      createdAt: new Date(),
      userIp,
      attempt: 1,
      // error429: false,
    });
    return next();
  }
  if (
    attemptCountUserIp &&
    attemptCountUserIp.attempt < attemptsLimit &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    await usersCollection?.find({ userIp }).forEach((doc) => {
      const oldAttemptCount = doc.attempt;
      usersCollection?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
    });
    return next();
  }
  if (
    attemptCountUserIp &&
    attemptCountUserIp!.attempt >= attemptsLimit &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) < secondsLimit
  ) {
    // await usersCollection?.updateOne({ userIp }, { $set: { error429: true } });
    // return next();
    // await usersCollection?.updateOne({ userIp }, { $set: { error429: true } });
    // await usersCollection?.updateOne({ userIp }, { $set: { createdAt: new Date(), attempt: 0 } });
    return res.send(429);
  }

  // if (
  //   attemptCountUserIp &&
  //   differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) > secondsLimit &&
  //   attemptCountUserIp!.error429 === true
  // ) {
  //   // await usersCollection?.deleteOne({ userIp });
  //   await usersCollection?.updateOne({ userIp }, { $set: { createdAt: new Date(), attempt: 0, error429: false } });
  //   return next();
  // }
  if (
    attemptCountUserIp &&
    differenceInSeconds(new Date(), attemptCountUserIp!.createdAt) >= secondsLimit
    // attemptCountUserIp!.error429 === false
  ) {
    await usersCollection?.updateOne({ userIp }, { $set: { createdAt: new Date(), attempt: 1 } });
    return next();
  }
};
