import express from 'express';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { jwtPassService } from '../utils/jwt-pass-service';

export const checkAccessTokenService = async (
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
        const user = await UsersRepositoryDB.getUserById(verifyUser!.id!);
        if (user) {
          req.user = user;
          return next();
        } else {
          return res.send(401);
        }
      } else {
        return res.send(401);
      }
    } else {
      return res.send(401);
    }
  } else {
    return res.send(401);
  }
};
