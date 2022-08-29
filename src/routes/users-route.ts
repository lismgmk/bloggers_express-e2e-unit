import { Router } from 'express';
import 'reflect-metadata';
import { UserController } from '../controllers/user-controller';
import { container } from '../inversify.config';
import { UserValidator } from '../validators/user-validator';

export const usersRouter = Router({});

const userContainer = container.resolve(UserController);
const userValidator = container.resolve(UserValidator);

usersRouter.get('/', userContainer.getAllUsers.bind(userContainer));
usersRouter.post('/', userValidator.createUser.bind(userValidator), userContainer.createUser.bind(userContainer));

usersRouter.delete('/:id', userValidator.deleteUser.bind(userValidator), userContainer.deleteUser.bind(userContainer));
