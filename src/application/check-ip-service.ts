import express from 'express';
import requestIp from 'request-ip';
import { subSeconds } from 'date-fns';
import { IpUsers } from '../models/ipUserModel';

export const checkIpServiceUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const secondsLimit = 10;
  const attemptsLimit = 5;
  const userIp = requestIp.getClientIp(req);
  try {
    const usersLoginDiffIp = await IpUsers.distinct('userIp', { path: '/login' }).exec();
    const findAllUsersIp = await IpUsers.find({
      userIp: req.ip,
      path: req.path,
      createdAt: {
        $gte: subSeconds(new Date(), secondsLimit),
      },
    }).exec();

    if (findAllUsersIp.length < attemptsLimit) {
      const newIpUser = new IpUsers({
        createdAt: new Date(),
        userIp,
        path: req.path,
      });
      await IpUsers.create(newIpUser);
      return next();
    } else if (findAllUsersIp.length >= attemptsLimit || usersLoginDiffIp.length >= attemptsLimit) {
      return res.send(429);
    } else {
      return next();
    }
  } catch (er) {
    return `DB error ${er}`;
  }
};
