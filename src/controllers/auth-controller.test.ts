import { getMockRes, getMockReq } from '@jest-mock/express';
import { AuthRepositoryDB } from '../repositories/auth-repository-db';
import { BlackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
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
      const sendStatus = await mockMailService.sendEmail(newUser.email, newUser.confirmationCode);
      const user = (await usersRepositoryDB.getUserByLogin(req.body.login)) as IUser;

      expect(sendStatus.error).toBeFalsy();
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
      const sendStatus = await mockMailService.sendEmail(newUser.email, newUser.confirmationCode);
      const user = (await usersRepositoryDB.getUserByLogin(req.body.login)) as IUser;

      expect(sendStatus.error).toBeTruthy();
      expect(user).toBe(null);
    });
  });
});
