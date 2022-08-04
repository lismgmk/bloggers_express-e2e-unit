import jwt from 'jsonwebtoken';
import express from 'express';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';

declare module 'express-serve-static-core' {
  interface Request {
    user?: string;
  }
}
export const checkRefreshTokenService = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const tokenRefresh = req.cookies.refresh_token;
  const user = tokenRefresh && (await jwt.verify(tokenRefresh, process.env.ACCESS_TOKEN_SECRET || ''));
  const isChecked = tokenRefresh && (await blackListTokensRepositoryDB.checkToken(tokenRefresh));
  if (tokenRefresh && user && !isChecked) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user = user.id;
    return next();
  } else {
    return res.sendStatus(401);
  }
};
