import supertest from 'supertest';
import { app } from '../index';
import { fakerConnectDb } from '../testDb';

// const agent = request.agent(app);
const agent = supertest(app);

describe('GET /users', function () {
  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });
  it('user.name should be an case-insensitive match for "john"', (done) => {
    agent
      .get('/users?PageSize=3&PageNumber=1')
      // .get('/bloggers?PageNumber=1&PageSize=9&SearchNameTerm=')
      // .send('name=john') // x-www-form-urlencoded upload
      // .set('Accept', 'application/json')
      .expect(200)
      .then((res) => {
        res.body.items.length = 2;
        res.body.items[0].accountData.userName = 'li8ss6';
        done();
      });
  });
});
