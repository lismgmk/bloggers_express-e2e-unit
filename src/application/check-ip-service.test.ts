import { getMockRes, getMockReq } from '@jest-mock/express';
import { checkIpServiceUser, ipUsersRepositoryDB } from '../inversify.config';
import { IpUsersRepositoryDB } from '../repositories/ipusers-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { CheckIpServiceUser, AttemptsLimit } from './check-ip-service';

describe('test check ip service service test', function () {
  const ip_1 = ':001';
  const ip_2 = ':002';
  const path = '/login';
  const countTestAttempt = 1;

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });
  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  describe('test ipStatus method', () => {
    it('should add ipUser and call next', async () => {
      const { res, next } = getMockRes();

      const req = getMockReq({ ip: ip_1, path });

      await checkIpServiceUser.ipStatus(req, res, next);
      const allUsers = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });

      expect(allUsers.length).toBe(1);
      expect(next).toBeCalled();
    });

    it('should not call next when attempt enter >= limit attempt for login path', async () => {
      const { res, next } = getMockRes();
      const mockAttemptList = {
        get CONST_ATTEMPT() {
          return countTestAttempt;
        },
      } as AttemptsLimit;

      const testCheckIpServiceUser = new CheckIpServiceUser(new IpUsersRepositoryDB(), mockAttemptList);
      const req = getMockReq({ ip_1, path });

      await testCheckIpServiceUser.ipStatus(req, res, next);
      const allUsers1 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });

      expect(allUsers1.length).toBe(1);
      expect(next).toBeCalledTimes(1);
      await testCheckIpServiceUser.ipStatus(req, res, next);
      const allUsers2 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req.ip, path: req.path });
      expect(next).toBeCalledTimes(1);
      expect(allUsers2.length).toBe(1);
    });

    it('should call next when no limit attempt increase (2 attempts from different ip with limit countTestAttempt=1) and not to call when increase limit attempt from one ip ', async () => {
      const { res, next } = getMockRes();
      const mockAttemptList = {
        get CONST_ATTEMPT() {
          return countTestAttempt;
        },
      } as AttemptsLimit;

      const testCheckIpServiceUser = new CheckIpServiceUser(new IpUsersRepositoryDB(), mockAttemptList);
      const req_1 = getMockReq({ ip: ip_1, path });
      const req_2 = getMockReq({ ip: ip_2, path });

      await testCheckIpServiceUser.ipStatus(req_1, res, next);
      const allUsersIp1 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req_1.ip, path: req_1.path });

      expect(allUsersIp1.length).toBe(1);
      expect(next).toBeCalledTimes(1);
      await testCheckIpServiceUser.ipStatus(req_2, res, next);
      const allUsersIp2 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req_2.ip, path: req_1.path });

      expect(allUsersIp2.length).toBe(1);
      expect(next).toBeCalledTimes(2);

      await testCheckIpServiceUser.ipStatus(req_1, res, next);
      const allUsersIp3 = await ipUsersRepositoryDB.getAllUsersIp({ userIp: req_1.ip, path: req_1.path });
      expect(next).toBeCalledTimes(2);
      expect(allUsersIp3.length).toBe(1);
    });
  });
});
