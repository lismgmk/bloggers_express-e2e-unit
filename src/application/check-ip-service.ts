import express from 'express';
import requestIp from 'request-ip';
import { subSeconds } from 'date-fns';
import { collections } from '../connect-db';

export const checkIpServiceUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  const usersLoginDiffIp = await collections.ipUsers?.distinct('userIp', { path: '/login' });

  const findAllUsersIp = await collections.ipUsers
    ?.find({
      userIp: req.ip,
      path: req.path,
      createdAt: {
        $gte: subSeconds(new Date(), secondsLimit),
      },
    })
    .toArray();
  if (findAllUsersIp!.length < attemptsLimit) {
    await collections.ipUsers?.insertOne({
      createdAt: new Date(),
      userIp,
      path: req.path,
    });
    return next();
  } else if (findAllUsersIp!.length >= attemptsLimit || usersLoginDiffIp!.length >= attemptsLimit) {
    return res.send(429);
  } else {
    return next();
  }
};
