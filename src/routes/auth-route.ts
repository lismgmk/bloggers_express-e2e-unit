import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';

export const authRouter = Router({});

authRouter.post(
  '/login',
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
      if (isCheck === 'error') {
        res.status(401).send('wrong pass');
      } else {
        res.status(200).send(isCheck);
      }
    }
  },
);
