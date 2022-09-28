import { ObjectId } from 'mongodb';
import { container } from '../inversify.config';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import { BlackListTokensRepositoryDB } from './black-list-tokens-repository-db';

export interface IToken {
  tokenValue: string;
  _id: ObjectId;
}

describe('test black-list repository', () => {
  const tokenValue = 'new token';
  const blackListTokensRepositoryDB = container.get<BlackListTokensRepositoryDB>(BlackListTokensRepositoryDB);
  // const blackListTokensRepositoryDB = new BlackListTokensRepositoryDB();

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  it('should check exist token', async () => {
    await blackListTokensRepositoryDB.addToken(tokenValue);
    const existedToken = (await blackListTokensRepositoryDB.checkToken(tokenValue)) as IToken;
    expect(existedToken.tokenValue).toEqual(tokenValue);
  });

  it('should create token', async () => {
    const newToken = (await blackListTokensRepositoryDB.addToken(tokenValue)) as IToken;
    expect(newToken.tokenValue).toBe(tokenValue);
  });

  it('should return null for nonexistent token', async () => {
    const existedToken = (await blackListTokensRepositoryDB.checkToken(tokenValue)) as IToken;
    expect(existedToken).toBe(null);
  });
});
