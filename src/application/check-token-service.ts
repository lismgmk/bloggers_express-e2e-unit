import express from 'express';
import { injectable, inject } from 'inversify';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { jwtPassService } from '../utils/jwt-pass-service';
import 'reflect-metadata';

@injectable()
export class CheckTokenService {
  constructor(@inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB) {}

  async noBlockToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const accessToken = authHeader!.split(' ')[1];
      if (accessToken) {
        const verifyUser = jwtPassService.verifyJwt(accessToken);
        if (verifyUser) {
          const user = await this.usersRepositoryDB.getUserById(verifyUser!.id!);
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
  }
  async accessToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers['authorization'];

    if (authHeader) {
      const accessToken = authHeader!.split(' ')[1];
      if (accessToken) {
        const verifyUser = jwtPassService.verifyJwt(accessToken);
        if (verifyUser) {
          const user = await this.usersRepositoryDB.getUserById(verifyUser!.id!);
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
  }
  async refreshToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const tokenRefresh = req.cookies.refreshToken;

    if (tokenRefresh) {
      const verifyUser = jwtPassService.verifyJwt(tokenRefresh);
      const user = await this.usersRepositoryDB.getUserById(verifyUser!.id!);
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
  }
}
