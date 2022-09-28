import { subSeconds } from 'date-fns';
import { injectable } from 'inversify';
import { IpUsers } from '../models/ipUserModel';

@injectable()
export class IpUsersRepositoryDB {
  private secondsLimit: number;
  constructor() {
    this.secondsLimit = 10;
  }

  async getAllUsersIp(params: { userIp: string; path: string }) {
    try {
      return await IpUsers.find({
        userIp: params.userIp,
        path: params.path,
        createdAt: {
          $gte: subSeconds(new Date(), this.secondsLimit),
        },
      }).exec();
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async createUsersIp(params: { userIp: string; path: string }) {
    try {
      const newIpUser = new IpUsers({
        createdAt: new Date(),
        userIp: params.userIp,
        path: params.path,
      });
      return await IpUsers.create(newIpUser);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async usersLoginDiffIp(params: { userIp: string; filter: { path: string } }) {
    try {
      return await IpUsers.distinct(params.userIp, params.filter).exec();
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
