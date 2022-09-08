import { getMockRes, getMockReq } from '@jest-mock/express';
import { AuthRepositoryDB } from '../repositories/auth-repository-db';
import { BlackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { newUser1 } from '../testParams/test-route-values';
import { IUser } from '../types';
import { JwtPassService } from '../utils/jwt-pass-service';
import { MailService } from '../utils/mail-service';
import { AuthController } from './auth-controller';

describe('test auth-controller', function () {
  const newUser = {
    login: 'User',
    password: '123456',
    email: 'someemail@mail.mail',
    confirmationCode: '99',
  };

  const usersRepositoryDB = new UsersRepositoryDB();
  const jwtPassService = new JwtPassService();
  const authRepositoryDB = new AuthRepositoryDB(usersRepositoryDB, jwtPassService);
  const blackListTokensRepositoryDB = new BlackListTokensRepositoryDB();

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  describe('test registration method', () => {
    it('should get success send mock email and create new user', async () => {
      const mockMailService = {
        sendEmail: jest.fn().mockImplementation(() => {
          console.log('Email was sent');
          return { error: false };
        }),
      };
      const authController = new AuthController(
        usersRepositoryDB,
        authRepositoryDB,
        blackListTokensRepositoryDB,
        jwtPassService,
        mockMailService,
      );
      const { res } = getMockRes();
      const req = getMockReq({ body: { login: newUser.login, password: newUser.password, email: newUser.email } });
      await authController.registration(req, res);
      const user = (await usersRepositoryDB.getUserByLogin(req.body.login)) as IUser;

      expect(mockMailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(user.accountData.userName).toBe(newUser.login);
    });

    it('should get error send mock email and not to create new user', async () => {
      const mockMailService = {
        sendEmail: jest.fn().mockImplementation(() => {
          console.log('Email was not sent');
          return { error: true };
        }),
      } as MailService;
      const authController = new AuthController(
        usersRepositoryDB,
        authRepositoryDB,
        blackListTokensRepositoryDB,
        jwtPassService,
        mockMailService,
      );

      const { res } = getMockRes();
      const req = getMockReq({ body: { login: newUser.login, password: newUser.password, email: newUser.email } });
      await authController.registration(req, res);
      const user = (await usersRepositoryDB.getUserByLogin(req.body.login)) as IUser;

      expect(mockMailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(user).toBe(null);
    });
  });

  describe('test registrationEmailResending method', () => {
    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
    });
    it('should send email and update code', async () => {
      const mockMailService = {
        sendEmail: jest.fn().mockImplementation(() => {
          console.log('Email was sent');
          return { error: false };
        }),
      };
      const authController = new AuthController(
        usersRepositoryDB,
        authRepositoryDB,
        blackListTokensRepositoryDB,
        jwtPassService,
        mockMailService,
      );

      const { res } = getMockRes();
      const req = getMockReq({ body: { email: newUser1.email } });
      await authController.registrationEmailResending(req, res);
      const user = (await usersRepositoryDB.getUserByEmail(req.body.email)) as IUser;
      expect(mockMailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(user.emailConfirmation.confirmationCode).not.toEqual(newUser1.confirmationCode);
    });

    it('should not update code', async () => {
      const mockMailService = {
        sendEmail: jest.fn().mockImplementation(() => {
          console.log('Email was not sent');
          return { error: true };
        }),
      } as MailService;
      const authController = new AuthController(
        usersRepositoryDB,
        authRepositoryDB,
        blackListTokensRepositoryDB,
        jwtPassService,
        mockMailService,
      );
      const { res } = getMockRes();
      const req = getMockReq({ body: { email: newUser.email } });
      await authController.registrationEmailResending(req, res);
      const user = (await usersRepositoryDB.getUserByEmail(newUser1.email)) as IUser;
      expect(mockMailService.sendEmail).toHaveBeenCalledTimes(1);
      expect(user.emailConfirmation.confirmationCode).toBe(newUser1.confirmationCode);
    });
  });
});
