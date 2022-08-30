import { Router } from 'express';
import { userController, userValidator } from '../inversify.config';

export const usersRouter = Router({});

usersRouter.get('/', userController.getAllUsers.bind(userController));
usersRouter.post('/', userValidator.createUser.bind(userValidator), userController.createUser.bind(userController));

usersRouter.delete(
  '/:id',
  userValidator.deleteUser.bind(userValidator),
  userController.deleteUser.bind(userController),
);
