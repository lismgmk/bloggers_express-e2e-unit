import { Router } from 'express';
import { testingController } from '../inversify.config';

export const testingRouter = Router({});

testingRouter.delete('/all-data', testingController.deleteAllCollections.bind(testingController));
