import express from 'express';
import { jwtPassService } from '../utils/jwt-pass-service';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { IUser } from '../types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
export const noBlockCheckAccessService = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (authHeader) {
    const accessToken = authHeader!.split(' ')[1];
    if (accessToken) {
      const verifyUser = jwtPassService.verifyJwt(accessToken);
      if (verifyUser) {
        const user = await usersRepositoryDB.getUserById(verifyUser!.id!);
        if (user) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          req.user = user;
          return next();
        } else {
          return res.send(400);
        }
      } else {
        return res.send(400);
      }
    } else {
      return res.send(400);
    }
  } else {
    return next();
  }
};
