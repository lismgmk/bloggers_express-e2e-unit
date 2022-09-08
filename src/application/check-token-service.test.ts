import { getMockRes, getMockReq } from '@jest-mock/express';
import { ObjectId } from 'mongodb';
import { BlackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { newUser1 } from '../testParams/test-route-values';
import { IUser } from '../types';
import { JwtPassService } from '../utils/jwt-pass-service';
import { expiredAccess } from '../variables';
import { CheckTokenService } from './check-token-service';

describe('test check token service test', function () {
  const usersRepositoryDB = new UsersRepositoryDB();
  const jwtPassService = new JwtPassService();
  const blackListTokensRepositoryDB = new BlackListTokensRepositoryDB();
  const checkTokenService = new CheckTokenService(usersRepositoryDB, blackListTokensRepositoryDB, jwtPassService);

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });
  beforeEach(async () => {
    await usersRepositoryDB.createUser(
      newUser1.login,
      newUser1.password,
      newUser1.email,
      newUser1.userIp,
      newUser1.confirmationCode,
    );
  });
  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  describe('test accessToken method', () => {
    it('should called next fn for access token', async () => {
      const { res, next } = getMockRes();

      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      const accessToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredAccess);
      const bearer = `Bearer ${accessToken}`;

      const req = getMockReq({ headers: { authorization: bearer } });

      await checkTokenService.accessToken(req, res, next);

      expect(next).toBeCalled();
    });

    it('should return error if token is expired', async () => {
      const expiredAccessInvalid = '0s';
      const { res, next } = getMockRes();

      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      const accessToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredAccessInvalid);
      const bearer = `Bearer ${accessToken}`;

      const req = getMockReq({ headers: { authorization: bearer } });

      await checkTokenService.accessToken(req, res, next);
      expect(next).not.toBeCalled();
    });

    it('should return error if invalid token', async () => {
      const { res, next } = getMockRes();

      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      const accessToken = newUser._id;
      const bearer = `Bearer ${accessToken}`;

      const req = getMockReq({ headers: { authorization: bearer } });

      await checkTokenService.accessToken(req, res, next);

      expect(next).not.toBeCalled();
    });

    it('should return error if there is not token in headers', async () => {
      const { res, next } = getMockRes();

      const req = getMockReq();

      await checkTokenService.accessToken(req, res, next);

      expect(next).not.toBeCalled();
    });
  });
  describe('test refreshToken method', () => {
    it('should called next fn for refresh token', async () => {
      const { res, next } = getMockRes();

      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      const refreshToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredAccess);

      const req = getMockReq({ cookies: { refreshToken } });

      await checkTokenService.refreshToken(req, res, next);

      expect(next).toBeCalled();
    });
  });
});
