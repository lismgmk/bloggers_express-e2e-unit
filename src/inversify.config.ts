import 'reflect-metadata';
import { Container } from 'inversify';
import { CheckIpServiceUser } from './application/check-ip-service';
import { CheckTokenService } from './application/check-token-service';
import { AuthController } from './controllers/auth-controller';
import { BloggersController } from './controllers/bloggers-controller';
import { CommentsController } from './controllers/comments-controller';
import { PostsController } from './controllers/posts-controller';
import { TestingController } from './controllers/testing-controller';
import { UserController } from './controllers/user-controller';
import { AuthRepositoryDB } from './repositories/auth-repository-db';
import { BloggersRepositoryDB } from './repositories/bloggers-repository-db';
import { CommentsRepositoryDb } from './repositories/comments-repository-db';
import { LikesRepositoryDB } from './repositories/likes-repository-db';
import { PostsRepositoryDB } from './repositories/posts-repository-db';
import { TestingRepositoryDB } from './repositories/testin-repository-db';
import { UsersRepositoryDB } from './repositories/users-repository-db';
import { AuthValidator } from './validators/auth-validator';
import { BloggersValidator } from './validators/bloggers-validator';
import { CommentsValidator } from './validators/comments-validator';
import { PostsValidator } from './validators/posts-validator';
import { UserValidator } from './validators/user-validator';

export const container = new Container();

container.bind<TestingRepositoryDB>(TestingRepositoryDB).toSelf();
// container.bind<UsersRepositoryDB>(Symbols.UsersRepositoryDB).to(UsersRepositoryDB);
container.bind<UsersRepositoryDB>(UsersRepositoryDB).to(UsersRepositoryDB);
container.bind<BloggersRepositoryDB>(BloggersRepositoryDB).toSelf();
container.bind<CommentsRepositoryDb>(CommentsRepositoryDb).toSelf();
container.bind<PostsRepositoryDB>(PostsRepositoryDB).toSelf();
container.bind<LikesRepositoryDB>(LikesRepositoryDB).toSelf();
container.bind<AuthRepositoryDB>(AuthRepositoryDB).toSelf();

//services
export const checkTokenService = container.resolve(CheckTokenService);
export const checkIpServiceUser = container.resolve(CheckIpServiceUser);

//validators
export const authValidator = container.resolve(AuthValidator);
export const bloggersValidator = container.resolve(BloggersValidator);
export const userValidator = container.resolve(UserValidator);
export const postsValidator = container.resolve(PostsValidator);
export const commentsValidator = container.resolve(CommentsValidator);

//controllers
export const testingController = container.resolve(TestingController);
export const authController = container.resolve(AuthController);
export const userController = container.resolve(UserController);
// export const userController = container.get(UserController);
export const bloggersController = container.resolve(BloggersController);
export const postsController = container.resolve(PostsController);
export const commentsController = container.resolve(CommentsController);

// export const Symbols = {
//   UsersRepositoryDB: Symbol.for('UsersRepositoryDB'),
// };

// new ContainerModule((bind: interfaces.Bind) => {
//   bind<TestingRepositoryDB>(TestingRepositoryDB).toSelf();
//   bind<UsersRepositoryDB>(UsersRepositoryDB).toSelf();
//   bind<BloggersRepositoryDB>(BloggersRepositoryDB).toSelf();
//   bind<CommentsRepositoryDb>(CommentsRepositoryDb).toSelf();
//   bind<PostsRepositoryDB>(PostsRepositoryDB).toSelf();
//   bind<LikesRepositoryDB>(LikesRepositoryDB).toSelf();
// });
