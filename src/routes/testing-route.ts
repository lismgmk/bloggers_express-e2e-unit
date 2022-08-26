import express, { Router } from 'express';
import { TestingRepositoryDB } from '../repositories/testin-repository-db';

export const testingRouter = Router({});

export class TestingController {
  testingRepositoryDB: TestingRepositoryDB;
  constructor() {
    this.testingRepositoryDB = new TestingRepositoryDB();
  }
  async deleteAllCollections(req: express.Request, res: express.Response) {
    const deleteAllData = await this.testingRepositoryDB.deleteAll();
    if (deleteAllData) {
      res.send(204);
    } else {
      res.send(400);
    }
  }
}
const testingController = new TestingController();
testingRouter.delete('/all-data', testingController.deleteAllCollections.bind(testingController));
