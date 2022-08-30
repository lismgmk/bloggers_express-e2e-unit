import 'reflect-metadata';
import { Container } from 'inversify';
import { CheckIpServiceUser } from './application/check-ip-service';
import { CheckTokenService } from './application/check-token-service';
import { AuthController } from './controllers/auth-controller';
import { BloggersController } from './controllers/bloggers-controller';
import { TestingController } from './controllers/testing-controller';
import { UserController } from './controllers/user-controller';
import { BloggersRepositoryDB } from './repositories/bloggers-repository-db';
import { TestingRepositoryDB } from './repositories/testin-repository-db';
import { UsersRepositoryDB } from './repositories/users-repository-db';
import { AuthValidator } from './validators/auth-validator';
import { BloggersValidator } from './validators/bloggers-validator';
import { UserValidator } from './validators/user-validator';

export const container = new Container();

//services
export const checkTokenService = container.resolve(CheckTokenService);
export const checkIpServiceUser = container.resolve(CheckIpServiceUser);

//validators
export const authValidator = container.resolve(AuthValidator);
export const bloggersValidator = container.resolve(BloggersValidator);
export const userValidator = container.resolve(UserValidator);

//controllers
export const testingContainer = container.resolve(TestingController);
export const authController = container.resolve(AuthController);
export const userController = container.resolve(UserController);
export const bloggersController = container.resolve(BloggersController);

container.bind<TestingRepositoryDB>(TestingRepositoryDB).toSelf();
container.bind<UsersRepositoryDB>(UsersRepositoryDB).toSelf();
container.bind<BloggersRepositoryDB>(BloggersRepositoryDB).toSelf();
