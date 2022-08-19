import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import basicAuth from 'express-basic-auth';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { ObjectId } from 'mongodb';
import requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';

export const usersRouter = Router({});

usersRouter.get('/', async (req, res) => {
  const limit = parseInt(req.query?.PageSize as string) || 10;
  const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
  res.status(200).send(await usersRepositoryDB.getAllUsers(limit, pageNumber));
});

usersRouter.post(
  '/',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const clientIp = requestIp.getClientIp(req);
      const confirmationCode = uuidv4();
      const newUser = await usersRepositoryDB.createUser(
        req.body.login,
        req.body.password,
        req.body.email,
        clientIp!,
        confirmationCode,
      );
      await usersRepositoryDB.confirmUserByLogin(req.body.login);
      return res.status(201).send(newUser);
    }
  },
);

usersRouter.delete(
  '/:id',
  basicAuth({
    users: { admin: 'qwerty' },
  }),
  async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const user = await usersRepositoryDB.getUserById(req.params.id);
      if (!user) {
        res.send(404);
      } else {
        const deletedUser = await usersRepositoryDB.deleteUser(req.params.id);
        if (typeof deletedUser === 'string') {
          res.status(430).send(deletedUser);
        } else {
          res.send(204);
        }
      }
    }
  },
);
