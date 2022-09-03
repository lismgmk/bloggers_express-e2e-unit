import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { app } from '../index';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testDb';
import { IUser } from '../types';

const agent = supertest(app);

describe('test user-router', function () {
  const pageSize = 3;
  const pageNumber = 1;
  const adminToken = { correct: 'YWRtaW46cXdlcnR5', wrong: '00000000000' };

  const newUser1 = {
    login: 'User-1',
    password: '123456',
    email: 'someemail-1@mail.mail',
    userIp: '1a',
    confirmationCode: '11',
  };

  const newUser2 = {
    login: 'User-2',
    password: '123456',
    email: 'someemail-2@mail.mail',
    userIp: '2a',
    confirmationCode: '22',
  };

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

  describe('test get "/" endpoint - get all users', () => {
    it('should return all users', async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
      await usersRepositoryDB.createUser(
        newUser2.login,
        newUser2.password,
        newUser2.email,
        newUser2.userIp,
        newUser2.confirmationCode,
      );

      await agent
        .get(`/users?PageSize=${pageSize}&PageNumber=${pageNumber}`)
        .expect(200)
        // .expect((res) => {
        //   expect(res.body.items.length).toBe(1);
        //   expect(res.body.items[0].login).toBe(newUser1.login);
        // })
        // .end((err, res) => {
        //   if (err) return err;
        //   return res;
        // });
        .then(async (res) => {
          expect(res.body.items.length).toBe(2);
          expect(res.body.items[0].login).toBe(newUser1.login);
          const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
          expect(newUser.accountData.userName).toBe(newUser1.login);
        });
    });
  });

  describe('test post  "/" endpoint - create confirmed user', () => {
    const bodyParams = { login: newUser1.login, password: newUser1.password, email: newUser1.email };
    const invalidUser = {
      login: 'Us',
      password: '12',
      email: 'someemailmail.mail',
    };
    it('should create new user with confirm field true', async () => {
      await agent
        .post(`/users`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(201)
        .then(async (res) => {
          expect(res.body.login).toBe(newUser1.login);
          const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
          expect(newUser.emailConfirmation.isConfirmed).toBeTruthy();
        });
    });

    it('should return unauthorized status', (done) => {
      agent
        .post(`/users`)
        .set('Authorization', `Basic ${adminToken.wrong}`)
        .send(bodyParams)
        .expect(401)
        .then(() => {
          done();
        });
    });

    it('should return error for invalid body param ', (done) => {
      agent
        .post(`/users`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(invalidUser)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(3);
          expect(res.body.errorsMessages[0].field).toBe('login');
          expect(res.body.errorsMessages[1].field).toBe('password');
          expect(res.body.errorsMessages[2].field).toBe('email');
          done();
        });
    });
  });

  describe('test delete  "/:id" endpoint - delete user', () => {
    let userId = new ObjectId();
    beforeEach(async () => {
      await usersRepositoryDB.createUser(
        newUser1.login,
        newUser1.password,
        newUser1.email,
        newUser1.userIp,
        newUser1.confirmationCode,
      );
      const user = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
      userId = user._id!;
    });
    it('should delete user ', async () => {
      await agent
        .delete(`/users/${userId}`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .expect(204)
        .then(async () => {
          const newUser = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
          expect(newUser).toBe(null);
        });
    });

    it('should return error when id invalid ', () => {
      agent.delete(`/users/${pageNumber}`).set('Authorization', `Basic ${adminToken.correct}`).expect(404);
    });
  });
});
