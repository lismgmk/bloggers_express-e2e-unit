import express from 'express';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { jwtPassService } from '../utils/jwt-pass-service';

export const checkRefreshTokenService = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const tokenRefresh = req.cookies.refreshToken;

  if (tokenRefresh) {
    const verifyUser = jwtPassService.verifyJwt(tokenRefresh);
    const user = await usersRepositoryDB.getUserById(verifyUser!.id!);
    if (verifyUser && user) {
      const isChecked = tokenRefresh && (await blackListTokensRepositoryDB.checkToken(tokenRefresh));
      if (!isChecked) {
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
};
