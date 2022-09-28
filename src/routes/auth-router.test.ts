import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { app } from '../index';
import { BlackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { newUser1, invalidUser } from '../testParams/test-route-values';
import { IUser } from '../types';
import { JwtPassService } from '../utils/jwt-pass-service';
import { expiredAccess, expiredRefresh } from '../variables';

const agent = supertest(app);

describe('test auth-router "/auth"', function () {
  const usersRepositoryDB = new UsersRepositoryDB();

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test  post "/login" endpoint', () => {
    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      expect(newUser.accountData.userName).toBe(newUser1.login);
    });
    afterEach(async () => {
      await fakerConnectDb.clearDatabase();
    });
    it('should return accessToken in body and refreshToken in headers', async () => {
      const bodyParams = { login: newUser1.login, password: newUser1.password };

      await agent
        .post(`/auth/login`)
        .send(bodyParams)
        .expect(200)
        .then(async (res) => {
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.headers['set-cookie'][0]).toBe('string');
        });
    });

    it('should return error if wrong password', async () => {
      const bodyParams = { login: newUser1.login, password: newUser1.password + newUser1.password };
      await agent.post(`/auth/login`).send(bodyParams).expect(401);
    });

    it('should return error if invalid body params', async () => {
      const bodyParams = { login: invalidUser.login, password: invalidUser.password };
      await agent
        .post(`/auth/login`)
        .send(bodyParams)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(2);
          expect(res.body.errorsMessages[0].field).toBe('login');
          expect(res.body.errorsMessages[1].field).toBe('password');
        });
    });
  });

  describe('test  post  "/registration" endpoint', () => {
    it('should send email and create user', async () => {
      const bodyParams = { login: newUser1.login, password: newUser1.password, email: newUser1.email };

      await agent
        .post(`/auth/registration`)
        .send(bodyParams)
        .expect(204)
        .then(async () => {
          const user = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
          expect(user.accountData.userName).toBe(newUser1.login);
        });
    });

    it('should return error if invalid body params', async () => {
      const bodyParams = { login: invalidUser.login, password: invalidUser.password, email: invalidUser.email };
      await agent
        .post(`/auth/registration`)
        .send(bodyParams)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(3);
          expect(res.body.errorsMessages[0].field).toBe('login');
          expect(res.body.errorsMessages[1].field).toBe('password');
          expect(res.body.errorsMessages[2].field).toBe('email');
        });
    });
  });

  describe('test  post  "/registration-email-resending" endpoint ', () => {
    it('should resend email', async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      expect(newUser.accountData.userName).toBe(newUser1.login);
      const bodyParams = { email: newUser1.email };

      await agent.post(`/auth/registration-email-resending`).send(bodyParams).expect(204);
    });

    it('should return error if invalid body params', async () => {
      const bodyParams = { email: invalidUser.email };
      await agent
        .post(`/auth/registration-email-resending`)
        .send(bodyParams)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(1);
          expect(res.body.errorsMessages[0].field).toBe('email');
        });
    });
  });

  describe('test  post  "/registration-confirmation" endpoint ', () => {
    let newUser: IUser;

    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
      newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      expect(newUser.emailConfirmation.isConfirmed).toBeFalsy();
    });

    it('should change isConfirmed field on true', async () => {
      const code = newUser.emailConfirmation.confirmationCode;
      const bodyParams = { code };
      await agent
        .post(`/auth/registration-confirmation`)
        .send(bodyParams)
        .expect(204)
        .then(async () => {
          const user = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
          expect(user.emailConfirmation.isConfirmed).toBeTruthy();
        });
    });

    it('should return error if there is not user for code', async () => {
      const bodyParams = { code: newUser.accountData.userName };
      await agent
        .post(`/auth/registration-confirmation`)
        .send(bodyParams)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(1);
          expect(res.body.errorsMessages[0].field).toBe('code');
        });
    });
  });

  describe('test  post  "/refresh-token" endpoint ', () => {
    const jwtPassService = new JwtPassService();
    const blackListTokensRepositoryDB = new BlackListTokensRepositoryDB();

    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
    });

    it('should return new refresh token in headers and access token in body', async () => {
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;

      const refreshToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredRefresh);
      const cookie = `refreshToken=${refreshToken}; Path=/; Secure; HttpOnly;`;
      await agent
        .post(`/auth/refresh-token`)
        .set('Cookie', cookie)
        .expect(200)
        .then(async (res) => {
          expect(typeof res.body.accessToken).toBe('string');
          expect(typeof res.headers['set-cookie'][0]).toBe('string');
        });
    });
    it('should return error if refresh token in black list', async () => {
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;

      const refreshToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredRefresh);
      await blackListTokensRepositoryDB.addToken(refreshToken);

      const cookie = `refreshToken=${refreshToken}; Path=/; Secure; HttpOnly;`;
      await agent.post(`/auth/refresh-token`).set('Cookie', cookie).expect(401);
    });
  });

  describe('test  post  "/logout" endpoint ', () => {
    const jwtPassService = new JwtPassService();
    const blackListTokensRepositoryDB = new BlackListTokensRepositoryDB();

    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
    });

    it('should add refresh token  in  black list', async () => {
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;

      const refreshToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredRefresh);
      expect(await blackListTokensRepositoryDB.checkToken(refreshToken)).toBeNull();

      const cookie = `refreshToken=${refreshToken}; Path=/; Secure; HttpOnly;`;
      await agent
        .post(`/auth/logout`)
        .set('Cookie', cookie)
        .expect(204)
        .then(async () => {
          expect(await blackListTokensRepositoryDB.checkToken(refreshToken)).toBeTruthy();
        });
    });
  });
  describe('test  post  "/me" endpoint ', () => {
    const jwtPassService = new JwtPassService();

    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
    });

    it('should add refresh token  in  black list', async () => {
      const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;

      const accessToken = jwtPassService.createJwt(new ObjectId(newUser._id), expiredAccess);

      const bearer = `Bearer ${accessToken}`;
      await agent
        .get(`/auth/me`)
        .set('Authorization', bearer)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toEqual(
            expect.objectContaining({
              email: expect.any(String),
              login: expect.any(String),
              userId: expect.any(String),
            }),
          );
          expect(res.body.login).toBe(newUser1.login);
        });
    });
  });
});
