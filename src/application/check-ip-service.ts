import express from 'express';
import { injectable, inject } from 'inversify';
import { IpUsersRepositoryDB } from '../repositories/ipusers-repository-db';

@injectable()
export class AttemptsLimit {
  public get CONST_ATTEMPT() {
    return 5;
  }
}

@injectable()
export class CheckIpServiceUser {
  // protected attemptsLimit: number;
  constructor(
    @inject(IpUsersRepositoryDB) protected ipUsersRepositoryDB: IpUsersRepositoryDB,
    @inject(AttemptsLimit) protected attemptsLimit: AttemptsLimit,
  ) {
    // this.attemptsLimit = 5;
  }

  async ipStatus(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const usersLoginDiffIp = await this.ipUsersRepositoryDB.usersLoginDiffIp({
        userIp: 'userIp',
        filter: { path: '/login' },
      });
      const findAllUsersIp = await this.ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });
      if (typeof usersLoginDiffIp === 'string' || typeof findAllUsersIp === 'string') {
        return res.status(400).send(`DB error ${findAllUsersIp} ${usersLoginDiffIp}`);
      }
      if (findAllUsersIp.length < this.attemptsLimit.CONST_ATTEMPT) {
        const createdUserIp = await this.ipUsersRepositoryDB.createUsersIp({ userIp: req.ip, path: req.path });
        if (typeof createdUserIp === 'string') {
          return res.status(400).send(`DB error ${createdUserIp}`);
        }
        return next();
      } else if (
        findAllUsersIp.length >= this.attemptsLimit.CONST_ATTEMPT ||
        usersLoginDiffIp.length >= this.attemptsLimit.CONST_ATTEMPT
      ) {
        return res.send(429);
      } else {
        return next();
      }
    } catch (er) {
      return `DB error ${er}`;
    }
  }
}
