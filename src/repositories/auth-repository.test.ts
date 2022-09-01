import { fakerConnectDb } from '../testDb';
import { IUser } from '../types';
import { AuthRepositoryDB } from './auth-repository-db';
import { UsersRepositoryDB } from './users-repository-db';

describe('test auth repository', () => {
  const newUser = {
    login: 'User',
    password: '123456',
    email: 'someemail@mail.mail',
    userIp: '1a',
    confirmationCode: '99',
  };
  const unknownUser = {
    login: 'UnknownUser',
    confirmationCode: '00',
  };
  const token = { accessToken: 'access token' };
  const usersRepositoryDB = new UsersRepositoryDB();

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });
  let authRepositoryDB: AuthRepositoryDB;

  beforeEach(async () => {
    await usersRepositoryDB.createUser(
      newUser.login,
      newUser.password,
      newUser.email,
      newUser.userIp,
      newUser.confirmationCode,
    );

    const mockJwtPassService = {
      createJwt: jest.fn().mockImplementation(() => {
        return token.accessToken;
      }),
      verifyJwt: jest.fn(),
      checkPassBcrypt: jest.fn().mockImplementation(() => {
        return true;
      }),
    };

    authRepositoryDB = new AuthRepositoryDB(usersRepositoryDB, mockJwtPassService);
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test autUser method', () => {
    it('should return JWT token for login user', async () => {
      const loginUser = await authRepositoryDB.authUser(newUser.login, newUser.password);
      expect(loginUser).toEqual(token);
    });

    it('should return null if user nonexistent', async () => {
      const loginUser = await authRepositoryDB.authUser(unknownUser.login, newUser.password);
      expect(loginUser).toEqual(null);
    });
  });

  describe('test confirmEmail method', () => {
    it('should change field isConfirm on true', async () => {
      const existUser = (await usersRepositoryDB.getUserByLogin(newUser.login)) as IUser;
      expect(existUser.emailConfirmation.isConfirmed).toBeFalsy();
      await authRepositoryDB.confirmEmail(newUser.confirmationCode);
      const confirmedUser = (await usersRepositoryDB.getUserByLogin(newUser.login)) as IUser;
      expect(confirmedUser.emailConfirmation.isConfirmed).toBeTruthy();
    });
  });
});
