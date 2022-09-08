import { ObjectId } from 'mongodb';
import { container } from '../inversify.config';
import { IPlayersSchema } from '../models/playersModel';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { player_1 } from '../testParams/test-route-values';
import { PlayersRepositoryDB } from './players-repository-db';

describe('test players-repository', () => {
  const playersRepository = container.get<PlayersRepositoryDB>(PlayersRepositoryDB);

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  describe('test createNewPlayers method', () => {
    it('should create player', async () => {
      const newPlayer = (await playersRepository.createNewPlayers(player_1)) as IPlayersSchema;
      console.log(newPlayer);
      expect(newPlayer).toMatchObject(
        expect.objectContaining({
          userId: expect.any(ObjectId),
          gameId: expect.any(ObjectId),
          login: 'User-1',
          _id: expect.any(ObjectId),
          answers: expect.any(Array),
        }),
      );
    });
  });

  describe('test setAnswerPlayer method', () => {
    it('should update answer for player', async () => {
      const newPlayer = (await playersRepository.createNewPlayers(player_1)) as IPlayersSchema;
      expect(newPlayer).toMatchObject(
        expect.objectContaining({
          userId: expect.any(ObjectId),
          gameId: expect.any(ObjectId),
          login: 'User-1',
          _id: expect.any(ObjectId),
          answers: expect.any(Array),
        }),
      );
      const answerData = { playerId: newPlayer._id, answer: 'no', numberQuestion: 1 };
      const updatedPlayer = await playersRepository.setAnswerPlayer(answerData);
      expect(updatedPlayer).toMatchObject(
        expect.objectContaining({
          questionId: expect.any(ObjectId),
          answerStatus: 'Correct',
          addedAt: expect.any(Date),
        }),
      );
    });
  });
});
