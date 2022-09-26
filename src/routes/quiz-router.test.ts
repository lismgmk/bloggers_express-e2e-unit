import { ObjectId } from 'mongodb';
import supertest from 'supertest';
import { app } from '../index';
import { container } from '../inversify.config';
import { IGameSchema } from '../models/gamesModel';
import { IPlayersSchema } from '../models/playersModel';
import { GamesRepositoryDB } from '../repositories/games-repository-db';
import { PlayersRepositoryDB } from '../repositories/players-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { newUser1, newUser2, newUser3, player_2 } from '../testParams/test-route-values';
import { IUser } from '../types';
import { JwtPassService } from '../utils/jwt-pass-service';
import { expiredAccess } from '../variables';

const agent = supertest(app);

describe('test quiz-router "/pair-game-quiz"', function () {
  process.env.COUNT_QUESTIONS = '3';
  const usersRepositoryDB = new UsersRepositoryDB();
  const playersRepositoryDB = container.get<PlayersRepositoryDB>(PlayersRepositoryDB);
  const gamesRepositoryDB = container.get<GamesRepositoryDB>(GamesRepositoryDB);
  const jwtPassService = new JwtPassService();
  const pageNumber = 1;
  const pageSize = 3;
  let accessToken_1: string;
  let accessToken_2: string;
  let bearer_1: string;
  let bearer_2: string;
  let newUser_1: IUser;
  let newUser_2: IUser;
  const bodyParamsRight = { answer: 'yes' };
  const bodyParamsWrong = { answer: 'no' };

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
    await usersRepositoryDB.createUser(
      newUser2.login,
      newUser2.password,
      newUser2.email,
      newUser2.userIp,
      newUser2.confirmationCode,
    );

    newUser_1 = (await usersRepositoryDB.getUserByLogin(newUser1.login)) as IUser;
    accessToken_1 = jwtPassService.createJwt(new ObjectId(newUser_1._id), expiredAccess);
    bearer_1 = `Bearer ${accessToken_1}`;
    await agent
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', bearer_1)
      .expect(200)
      .then(async (res) => {
        expect(res.body).toMatchObject(
          expect.objectContaining({
            gameStatus: 'PendingSecondPlayer',
            questions: expect.any(Array),
            firstPlayerId: expect.any(String),
            secondPlayerId: null,
            pairCreatedDate: null,
            startGameDate: expect.any(String),
            finishGameDate: null,
            winnerUserId: null,
            _id: expect.any(String),
          }),
        );
      });

    newUser_2 = (await usersRepositoryDB.getUserByLogin(newUser2.login)) as IUser;
    accessToken_2 = jwtPassService.createJwt(new ObjectId(newUser_2._id), expiredAccess);
    bearer_2 = `Bearer ${accessToken_2}`;
    await agent
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Authorization', bearer_2)
      .expect(200)
      .then(async (res) => {
        expect(res.body).toMatchObject(
          expect.objectContaining({
            gameStatus: 'Active',
            questions: expect.any(Array),
            firstPlayerId: expect.any(String),
            secondPlayerId: expect.any(String),
            pairCreatedDate: expect.any(String),
            startGameDate: expect.any(String),
            finishGameDate: null,
            winnerUserId: null,
            _id: expect.any(String),
          }),
        );
      });
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test  post  "/pairs/connection" endpoint ', () => {
    it('should return error 403 if current user is already participating in active pair', async () => {
      await agent.post(`/pair-game-quiz/pairs/connection`).set('Authorization', bearer_2).expect(403);
    });
  });

  describe('test  get  "/pairs/my-current" endpoint ', () => {
    it('should returns current pair in which current user is taking part', async () => {
      await agent
        .get(`/pair-game-quiz/pairs/my-current`)
        .set('Authorization', bearer_2)
        .expect(200)
        .then(async (res) => {
          console.log(res.body);
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questions: expect.any(Array),
              status: 'Active',
            }),
          );
          expect(res.body.secondPlayer.user.login).toBe(player_2.login);
        });
    });
  });

  describe('test  get  "/pairs/get/:id" endpoint ', () => {
    it('should returns pair by id if current user is taking part in this pair', async () => {
      const verifyUser = jwtPassService.verifyJwt(accessToken_1);
      const currentPlayer = await playersRepositoryDB.findPlayerByUserId(verifyUser.id);
      const gameId = typeof currentPlayer !== 'string' && currentPlayer!.gameId;
      await agent
        .get(`/pair-game-quiz/pairs/get/${gameId}`)
        .set('Authorization', bearer_2)
        .expect(200)
        .then(async (res) => {
          console.log(res.body);
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questions: expect.any(Array),
              status: 'Active',
            }),
          );
          expect(res.body.secondPlayer.user.login).toBe(player_2.login);
        });
    });
  });

  describe('test  get  "/pairs/my" endpoint ', () => {
    it('should returns all pairs by id if current user is taking part in this pair', async () => {
      await agent
        .get(`/pair-game-quiz/pairs/my?pageNumber=${pageNumber}&pageSize=${pageSize}`)
        .set('Authorization', bearer_2)
        .expect(200)
        .then(async (res) => {
          console.log(res.body);
          expect(res.body).toMatchObject(
            expect.objectContaining({
              pagesCount: 1,
              page: pageNumber,
              pageSize: pageSize,
              totalCount: 1,
              items: expect.any(Array),
            }),
          );
          expect(res.body.items.length).toBe(1);
          expect(res.body.items[0].secondPlayer.user.login).toBe(player_2.login);
        });
    });
  });

  describe('test  get  "/users/top" endpoint ', () => {
    it('should returns top users', async () => {
      process.env.DECIDE_TIME_ANSWERS = '1';
      process.env.COUNT_QUESTIONS = '2';

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsRight)
        .expect(200);
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsRight)
        .expect(403);

      await agent
        .get(`/pair-game-quiz//users/top?pageNumber=${pageNumber}&pageSize=${pageSize}`)
        .expect(200)
        .then(async (res) => {
          console.log(res.body.items);
          // expect(res.body).toMatchObject(
          //   expect.objectContaining({
          //     pagesCount: 1,
          //     page: pageNumber,
          //     pageSize: pageSize,
          //     totalCount: 1,
          //     items: expect.any(Array),
          //   }),
          // );
          // expect(res.body.items.length).toBe(1);
          // expect(res.body.items[0].secondPlayer.user.login).toBe(player_2.login);
        });
    });
  });

  describe('test post "/pair-game-quiz/pairs/my-current/answers" endpoint', () => {
    it('should create active game,user_1 send 3 correct  answer and win game, user_2 send incorrect answers', async () => {
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsWrong)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsWrong)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            }),
          );
        });
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      const player_state_2_answer = (await playersRepositoryDB.findPlayerByUserId(newUser_1._id!)) as IPlayersSchema;
      expect(player_state_2_answer.score).toBe(4);
      const current_game = (await gamesRepositoryDB.getGameById(player_state_2_answer.gameId)) as IGameSchema;
      expect(current_game.gameStatus).toBe('Finished');
      expect(current_game.winnerUserId).toStrictEqual(player_state_2_answer._id);
    });

    it('should get draw in game,user_1 send 1 correct  answer and finish first, user_2 send 2 correct answers', async () => {
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsWrong)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsWrong)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsWrong)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            }),
          );
        });

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsRight)
        .expect(200)
        .then(async (res) => {
          expect(res.body).toMatchObject(
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            }),
          );
        });

      const player_state_2_answer = (await playersRepositoryDB.findPlayerByUserId(newUser_1._id!)) as IPlayersSchema;
      expect(player_state_2_answer.score).toBe(2);
      const current_game = (await gamesRepositoryDB.getGameById(player_state_2_answer.gameId)) as IGameSchema;
      expect(current_game.gameStatus).toBe('Finished');
      expect(current_game.winnerUserId).toBeNull();
    });

    it('should send error 403 when current user is not inside active pair', async () => {
      await usersRepositoryDB.createUser(
        newUser3.login,
        newUser3.password,
        newUser3.email,
        newUser3.userIp,
        newUser3.confirmationCode,
      );

      const newUser_3 = (await usersRepositoryDB.getUserByLogin(newUser3.login)) as IUser;
      const accessToken_3 = jwtPassService.createJwt(new ObjectId(newUser_3._id), expiredAccess);
      const bearer_3 = `Bearer ${accessToken_3}`;
      await agent.post(`/pair-game-quiz/pairs/connection`).set('Authorization', bearer_3).expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_2)
        .send(bodyParamsWrong)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_3)
        .send(bodyParamsWrong)
        .expect(403);
    });

    it('should send error 403 when user is in active pair but has already answered to all questions', async () => {
      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsRight)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsWrong)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsWrong)
        .expect(200);

      await agent
        .post(`/pair-game-quiz/pairs/my-current/answers`)
        .set('Authorization', bearer_1)
        .send(bodyParamsWrong)
        .expect(403);
    });

    it(
      'create active game, user_1 send 2 correct  answer and win game, ' +
        'user_2 lose because do not send answer in time ' +
        '(for tests waiting time = 0)',
      async () => {
        process.env.DECIDE_TIME_ANSWERS = '1';

        await agent
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .set('Authorization', bearer_1)
          .send(bodyParamsRight)
          .expect(200)
          .then(async (res) => {
            expect(res.body).toMatchObject(
              expect.objectContaining({
                questionId: expect.any(String),
                answerStatus: 'Correct',
                addedAt: expect.any(String),
              }),
            );
          });

        await agent
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .set('Authorization', bearer_1)
          .send(bodyParamsRight)
          .expect(200)
          .then(async (res) => {
            expect(res.body).toMatchObject(
              expect.objectContaining({
                questionId: expect.any(String),
                answerStatus: 'Correct',
                addedAt: expect.any(String),
              }),
            );
          });
        await agent
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .set('Authorization', bearer_1)
          .send(bodyParamsRight)
          .expect(200)
          .then(async (res) => {
            expect(res.body).toMatchObject(
              expect.objectContaining({
                questionId: expect.any(String),
                answerStatus: 'Correct',
                addedAt: expect.any(String),
              }),
            );
          });
        await agent
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .set('Authorization', bearer_2)
          .send(bodyParamsRight)
          .expect(200);
        await agent
          .post(`/pair-game-quiz/pairs/my-current/answers`)
          .set('Authorization', bearer_2)
          .send(bodyParamsRight)
          .expect(403);

        const player_state_1_answer = (await playersRepositoryDB.findPlayerByUserId(newUser_1._id!)) as IPlayersSchema;
        expect(player_state_1_answer.score).toBe(4);
        const current_game = (await gamesRepositoryDB.getGameById(player_state_1_answer.gameId)) as IGameSchema;
        expect(current_game.gameStatus).toBe('Finished');
        expect(current_game.winnerUserId).toStrictEqual(player_state_1_answer._id);
      },
      10000,
    );
  });
});
