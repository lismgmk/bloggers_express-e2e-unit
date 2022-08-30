import { Router } from 'express';
import 'reflect-metadata';
import { testingContainer } from '../inversify.config';

export const testingRouter = Router({});

testingRouter.delete('/all-data', testingContainer.deleteAllCollections.bind(testingContainer));
