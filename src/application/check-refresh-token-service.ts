import express from 'express';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { IUser } from '../types';
import { jwtPassService } from '../utils/jwt-pass-service';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser;
  }
}
export const checkRefreshTokenService = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const tokenRefresh = req.cookies.refreshToken;
  const verifyUser = jwtPassService.verifyJwt(tokenRefresh);
  const user = verifyUser && (await usersRepositoryDB.getUserById(verifyUser.id!));
  const isChecked = tokenRefresh && (await blackListTokensRepositoryDB.checkToken(tokenRefresh));
  if (tokenRefresh && user && !isChecked && verifyUser) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = user;
    return next();
  } else {
    return res.sendStatus(401);
  }
};
