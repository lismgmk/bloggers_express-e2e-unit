import { Router } from 'express';
import { userController } from '../inversify.config';
import { userValidator } from '../validators/user-validator';

export const usersRouter = Router({});

usersRouter.get('/', userController.getAllUsers.bind(userController));
usersRouter.post('/', userValidator.createUser(), userController.createUser.bind(userController));

usersRouter.delete('/:id', userValidator.deleteUser(), userController.deleteUser.bind(userController));
