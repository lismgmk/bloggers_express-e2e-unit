import { Router } from 'express';
import 'reflect-metadata';
import { TestingController } from '../controllers/testing-controller';
import { container } from '../inversify.config';

export const testingRouter = Router({});

const testingContainer = container.resolve(TestingController);
testingRouter.delete('/all-data', testingContainer.deleteAllCollections.bind(testingContainer));
