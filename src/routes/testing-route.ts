import express, { Router } from 'express';
import { testingRepositoryDB } from '../repositories/testin-repository-db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: express.Request, res: express.Response) => {
  const deleteAllData = await testingRepositoryDB.deleteAll();
  if (deleteAllData) {
    res.send(204);
  } else {
    res.send(401);
  }
});
