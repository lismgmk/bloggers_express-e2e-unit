import express from 'express';
import requestIp from 'request-ip';
import { subSeconds } from 'date-fns';
import { collections } from '../connect-db';

export const checkIpServiceUser2 = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);

  const findAllUsersIp = await collections.ipUsers
    ?.find({
      userIp: req.ip,
      path: req.path,
      createdAt: {
        $gte: subSeconds(new Date(), secondsLimit),
      },
    })
    .toArray();
  console.log(findAllUsersIp, 'find all users');
  if (findAllUsersIp!.length < attemptsLimit) {
    await collections.ipUsers?.insertOne({
      createdAt: new Date(),
      userIp,
      path: req.path,
    });
    return next();
  } else if (findAllUsersIp!.length >= attemptsLimit) {
    return res.send(429);
  } else {
    return next();
  }
};
