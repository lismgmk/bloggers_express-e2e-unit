import { container } from '../inversify.config';
import { fakerConnectDb } from '../testDb';
import { IBloggers, IPaginationResponse } from '../types';
import { BloggersRepositoryDB } from './bloggers-repository-db';

describe('test bloggers repository', () => {
  const pageSize = 3;
  const pageNumber = 1;
  const filterNameSlice = 'V';
  const newBlogger_1 = {
    name: 'Vova',
    youtubeUrl: 'https://newChanel1.com',
  };
  const newBlogger_2 = {
    name: 'Ira',
    youtubeUrl: 'https://newChanel2.com',
  };
  const newBlogger_3 = {
    name: 'Veranika',
    youtubeUrl: 'https://newChanel3.com',
  };

  const incorrectUrlBlogger = {
    name: 'new blogger',
    youtubeUrl: 'https/newChanel.com',
  };

  const fakeId = { id: '63112e36862987f5978863c8' };
  const bloggersRepositoryDB = container.get<BloggersRepositoryDB>(BloggersRepositoryDB);

  beforeAll(async () => {
    await fakerConnectDb.connect();
  });

  afterEach(async () => {
    await fakerConnectDb.clearDatabase();
  });

  afterAll(async () => {
    await fakerConnectDb.closeDatabase();
  });

  describe('test getAllBloggers method', () => {
    it('should return all bloggers', async () => {
      await bloggersRepositoryDB.createBlogger(newBlogger_1.name, newBlogger_1.youtubeUrl);
      await bloggersRepositoryDB.createBlogger(newBlogger_2.name, newBlogger_2.youtubeUrl);
      await bloggersRepositoryDB.createBlogger(newBlogger_3.name, newBlogger_3.youtubeUrl);
      const allBloggers = (await bloggersRepositoryDB.getAllBloggers(
        pageSize,
        pageNumber,
        filterNameSlice,
      )) as IPaginationResponse<IBloggers>;
      expect(allBloggers.items?.length).toBe(2);
      expect(allBloggers.items![0].name).toBe(newBlogger_1.name);
      expect(allBloggers.items![1].youtubeUrl).toBe(newBlogger_3.youtubeUrl);
    });
  });

  describe('test createBlogger method', () => {
    it('should return new blogger', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;
      expect(newBlogger.name).toBe(newBlogger_1.name);
    });

    it('should return error by url', async () => {
      const newBlogger = await bloggersRepositoryDB.createBlogger(
        incorrectUrlBlogger.name,
        incorrectUrlBlogger.youtubeUrl,
      );
      expect(typeof newBlogger).toBe('string');
    });
  });

  describe('test getBloggerById method', () => {
    it('should return blogger', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;
      const blogger = (await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString())) as IBloggers;
      expect(blogger.name).toBe(newBlogger_1.name);
    });

    it('should return error for nonexistent', async () => {
      await bloggersRepositoryDB.createBlogger(newBlogger_1.name, newBlogger_1.youtubeUrl);
      const blogger = await bloggersRepositoryDB.getBloggerById(fakeId.id);
      expect(blogger).toBe(null);
    });
  });

  describe('test upDateBlogger method', () => {
    it('should update blogger', async () => {
      const newBlogger = (await bloggersRepositoryDB.createBlogger(
        newBlogger_1.name,
        newBlogger_1.youtubeUrl,
      )) as IBloggers;

      expect(newBlogger.name).toBe(newBlogger_1.name);
      expect(newBlogger.id.toString()).toBe(newBlogger.id.toString());
      await bloggersRepositoryDB.upDateBlogger(newBlogger_2.name, newBlogger_2.youtubeUrl, newBlogger.id.toString());
      const blogger = (await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString())) as IBloggers;
      expect(blogger.name).toBe(newBlogger_2.name);
      expect(blogger.id).toBe(newBlogger.id.toString());
    });

    it('should return null for nonexistent', async () => {
      const updateNoneBlogger = await bloggersRepositoryDB.upDateBlogger(
        newBlogger_2.name,
        newBlogger_2.youtubeUrl,
        fakeId.id,
      );
      expect(updateNoneBlogger).toBe(null);
    });

    describe('test deleteBlogger method', () => {
      it('should delete blogger', async () => {
        const newBlogger = (await bloggersRepositoryDB.createBlogger(
          newBlogger_1.name,
          newBlogger_1.youtubeUrl,
        )) as IBloggers;

        expect(newBlogger.name).toBe(newBlogger_1.name);
        expect(newBlogger.id.toString()).toBe(newBlogger.id.toString());
        await bloggersRepositoryDB.deleteBlogger(newBlogger.id.toString());
        const blogger = await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString());
        expect(blogger).toBe(null);
      });

      it('should not delete blogger by fake id', async () => {
        const newBlogger = (await bloggersRepositoryDB.createBlogger(
          newBlogger_1.name,
          newBlogger_1.youtubeUrl,
        )) as IBloggers;

        expect(newBlogger.name).toBe(newBlogger_1.name);
        expect(newBlogger.id.toString()).toBe(newBlogger.id.toString());
        await bloggersRepositoryDB.deleteBlogger(fakeId.id);
        const blogger = await bloggersRepositoryDB.getBloggerById(newBlogger.id.toString());
        expect(blogger).not.toBe(null);
      });
    });
  });
});
