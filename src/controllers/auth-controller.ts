import express from 'express';
import { validationResult } from 'express-validator';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';
import { expiredAccess, expiredRefresh } from '../constants';
import { AuthRepositoryDB } from '../repositories/auth-repository-db';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { errorFormatter } from '../utils/error-util';
import { jwtPassService } from '../utils/jwt-pass-service';
import { mailService } from '../utils/mail-service';

@injectable()
export class AuthController {
  constructor(
    // @inject(Symbols.UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB,
    @inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB,
    // protected usersRepositoryDB: UsersRepositoryDB,
    @inject(AuthRepositoryDB) protected authRepositoryDB: AuthRepositoryDB,
  ) {}

  async login(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    const isCheck = await this.authRepositoryDB.authUser(req.body.login, req.body.password);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (!isCheck) {
      return res.send(401);
    } else {
      const user = await this.usersRepositoryDB.getUserByLogin(req.body.login);
      if (user) {
        const refreshToken = jwtPassService.createJwt(user._id, expiredRefresh);
        return res
          .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
          })
          .status(200)
          .send(isCheck);
      } else {
        return res.status(430).send('Db error');
      }
    }
  }

  async registration(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }

    const confirmationCode = uuidv4();

    await this.usersRepositoryDB.createUser(
      req.body.login,
      req.body.password,
      req.body.email,
      userIp!,
      confirmationCode,
    );
    const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
    if (isSendStatus.error) {
      await this.usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send('failed delete user');
    } else {
      return res.status(204).send(isSendStatus.data);
    }
  }

  async registrationEmailResending(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const newCode = uuidv4();
    await this.usersRepositoryDB.updateCodeByEmail(req.body.email, newCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, newCode);
    if (isSendStatus.error) {
      await this.usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send('failed delete user');
    } else {
      return res.send(204);
    }
  }

  async registrationConfirmation(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      return res.send(204);
    }
  }

  async getRefreshAccessToken(req: express.Request, res: express.Response) {
    const accessToken = jwtPassService.createJwt(req.user!._id!, expiredAccess);
    const refreshToken = jwtPassService.createJwt(req.user!._id!, expiredRefresh);
    const blackToken = await blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
    if (typeof blackToken === 'string') {
      res.status(430).send(blackToken);
    } else {
      return res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
        })
        .status(200)
        .send({ accessToken });
    }
  }

  async logout(req: express.Request, res: express.Response) {
    const confirmedUser = await this.usersRepositoryDB.confirmUserById(req.user!._id!.toString(), false);
    const blackToken = await blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
    if (typeof blackToken === 'string' || typeof confirmedUser === 'string') {
      res.status(430).send(`${blackToken} ${confirmedUser}`);
    } else {
      return res.send(204);
    }
  }

  async me(req: express.Request, res: express.Response) {
    return res.status(200).send({
      email: req.user!.accountData.email,
      login: req.user!.accountData.userName,
      userId: req.user!._id!.toString(),
    });
  }
}
