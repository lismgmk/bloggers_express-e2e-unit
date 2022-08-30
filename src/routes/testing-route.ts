import { Router } from 'express';
import 'reflect-metadata';
import { testingController } from '../inversify.config';

export const testingRouter = Router({});

testingRouter.delete('/all-data', testingController.deleteAllCollections.bind(testingController));
