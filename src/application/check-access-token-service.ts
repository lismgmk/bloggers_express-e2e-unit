import express from 'express';
import { jwtPassService } from '../utils/jwt-pass-service';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { IUser } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
export const checkAccessTokenService = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer Token
  if (!token) {
    res.status(401).json({
      errors: [
        {
          msg: 'Token not found',
        },
      ],
    });
  } else {
    try {
      const verifyUser = jwtPassService.verifyJwt(token);
      const user = verifyUser && (await usersRepositoryDB.getUserById(verifyUser.id!));
      if (verifyUser && user) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.user = user;
        return next();
      } else {
        res.status(401).send({
          errors: [
            {
              msg: 'Invalid token',
            },
          ],
        });
      }
    } catch (error) {
      res.status(401).send({
        errors: [
          {
            msg: 'Invalid token',
          },
        ],
      });
    }
  }
};
