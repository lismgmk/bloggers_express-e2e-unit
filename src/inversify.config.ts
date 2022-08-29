import 'reflect-metadata';
import { Container } from 'inversify';
import { TestingRepositoryDB } from './repositories/testin-repository-db';
import { UsersRepositoryDB } from './repositories/users-repository-db';

export const container = new Container();
container.bind<TestingRepositoryDB>(TestingRepositoryDB).toSelf();
container.bind<UsersRepositoryDB>(UsersRepositoryDB).toSelf();
