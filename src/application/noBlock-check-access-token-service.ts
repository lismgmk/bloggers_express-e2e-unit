import express from 'express';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { jwtPassService } from '../utils/jwt-pass-service';

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
          req.user = user;
          return next();
        } else {
          return next();
        }
      } else {
        return next();
      }
    } else {
      return next();
    }
  } else {
    return next();
  }
};
