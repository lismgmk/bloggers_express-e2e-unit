import express from 'express';
import { injectable, inject } from 'inversify';
import { TestingRepositoryDB } from '../repositories/testin-repository-db';

@injectable()
export class TestingController {
  constructor(@inject(TestingRepositoryDB) protected testingRepositoryDB: TestingRepositoryDB) {}
  async deleteAllCollections(req: express.Request, res: express.Response) {
    const deleteAllData = await this.testingRepositoryDB.deleteAll();
    if (deleteAllData) {
      res.send(204);
    } else {
      res.send(400);
    }
  }
}
