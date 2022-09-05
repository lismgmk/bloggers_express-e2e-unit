import supertest from 'supertest';
import { app } from '../index';
import { container } from '../inversify.config';
import { BloggersRepositoryDB } from '../repositories/bloggers-repository-db';
import { fakerConnectDb } from '../testParams/fake-connect-db';
import {
  newBlogger_1,
  newBlogger_2,
  newBlogger_3,
  pageSize,
  pageNumber,
  filterNameSlice,
  incorrectUrlBlogger,
  fakeId,
  adminToken,
} from '../testParams/test-route-values';
import { IBloggers } from '../types';

const agent = supertest(app);

describe('test bloggers-router "/bloggers"', () => {
  const bloggersRepositoryDB = container.get<BloggersRepositoryDB>(BloggersRepositoryDB);
  const bodyParams = { name: newBlogger_2.name, youtubeUrl: newBlogger_2.youtubeUrl };
  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test get "/" endpoint', () => {
    it('should return all bloggers', async () => {
      await bloggersRepositoryDB.createBlogger(newBlogger_1.name, newBlogger_1.youtubeUrl);
      await bloggersRepositoryDB.createBlogger(newBlogger_2.name, newBlogger_2.youtubeUrl);
      await bloggersRepositoryDB.createBlogger(newBlogger_3.name, newBlogger_3.youtubeUrl);

      await agent
        .get(`/bloggers?PageSize=${pageSize}&PageNumber=${pageNumber}&SearchNameTerm=${filterNameSlice}`)
        .expect(200)
        .then(async (res) => {
          expect(res.body.items.length).toBe(2);
          expect(res.body.items[0].name).toBe(newBlogger_1.name);
          expect(res.body.items[1].youtubeUrl).toBe(newBlogger_3.youtubeUrl);
        });
    });
  });

  describe('test post "/" endpoint - create blogger', () => {
    it('should return  new blogger with 201 status', async () => {
      await agent
        .post(`/bloggers`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(newBlogger_1)
        .expect(201)
        .then(async (res) => {
          expect(res.body.name).toBe(newBlogger_1.name);
        });
    });

    it('should return error with 400 status', async () => {
      await agent
        .post(`/bloggers`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(incorrectUrlBlogger)
        .expect(400)
        .then((res) => {
          expect(res.body.errorsMessages.length).toBe(1);
          expect(res.body.errorsMessages[0].field).toBe('youtubeUrl');
        });
    });

    it('should return unauthorized error with 401 status', async () => {
      await agent.post(`/bloggers`).set('Authorization', `Basic ${adminToken.wrong}`).send(newBlogger_1).expect(401);
    });
  });

  describe('test det "/:id" endpoint', () => {
    it('should return blogger with status 201', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;
      const blogger = (await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString())) as IBloggers;
      await agent
        .get(`/bloggers/${blogger.id}`)
        .expect(200)
        .then(async (res) => {
          expect(res.body.name).toBe(newBlogger_1.name);
        });
    });

    it('should return status 404 for nonexistent', async () => {
      await agent.get(`/bloggers/${fakeId}`).expect(404);
    });
  });

  describe('test put "/:id" endpoint', () => {
    it('should update blogger and return status 201', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;

      expect(newBlogger.name).toBe(newBlogger_1.name);
      expect(newBlogger.id.toString()).toBe(newBlogger.id.toString());

      await agent
        .put(`/bloggers/${newBlogger.id}`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(204)
        .then(async () => {
          const blogger = (await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString())) as IBloggers;
          expect(blogger.name).toBe(newBlogger_2.name);
        });
    });

    it('should return status 404 for nonexistent blogger', async () => {
      await agent
        .put(`/bloggers/${fakeId}`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .send(bodyParams)
        .expect(404);
    });
  });

  describe('test delete "/:id" endpoint', () => {
    it('should delete blogger and return status 204', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;

      expect(newBlogger.name).toBe(newBlogger_1.name);
      expect(newBlogger.id.toString()).toBe(newBlogger.id.toString());

      await agent
        .delete(`/bloggers/${newBlogger.id}`)
        .set('Authorization', `Basic ${adminToken.correct}`)
        .expect(204)
        .then(async () => {
          const blogger = (await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString())) as IBloggers;
          expect(blogger).toBeNull();
        });
    });
  });
});
