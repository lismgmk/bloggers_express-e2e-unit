import express from 'express';
import { validationResult } from 'express-validator';
import { inject, injectable } from 'inversify';
import requestIp from 'request-ip';
import { v4 as uuidv4 } from 'uuid';
import { BlackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { JwtPassService } from '../utils/jwt-pass-service';
import { MailService } from '../utils/mail-service';
import { expiredAccess, expiredRefresh } from '../variables';
import { AuthRepositoryDB } from '../repositories/auth-repository-db';
import { UsersRepositoryDB } from '../repositories/users-repository-db';
import { errorFormatter } from '../utils/error-util';

@injectable()
export class AuthController {
  constructor(
    @inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB,
    @inject(AuthRepositoryDB) protected authRepositoryDB: AuthRepositoryDB,
    @inject(BlackListTokensRepositoryDB) protected blackListTokensRepositoryDB: BlackListTokensRepositoryDB,
    @inject(JwtPassService) protected jwtPassService: JwtPassService,
    @inject(MailService) protected mailService: MailService,
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
        const refreshToken = this.jwtPassService.createJwt(user._id, expiredRefresh);
        return res
          .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
          })
          .status(200)
          .send(isCheck);
      } else {
        return res.status(400).send('Db error');
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
    const isSendStatus = await this.mailService.sendEmail(req.body.email, confirmationCode);

    if (isSendStatus.error) {
      return res.status(400).send('Error with sending email, user was not created');
    } else {
      await this.usersRepositoryDB.createUser(
        req.body.login,
        req.body.password,
        req.body.email,
        userIp!,
        confirmationCode,
      );
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
    const isSendStatus = await this.mailService.sendEmail(req.body.email, newCode);
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
    const accessToken = this.jwtPassService.createJwt(req.user!._id!, expiredAccess);
    const refreshToken = this.jwtPassService.createJwt(req.user!._id!, expiredRefresh);
    const blackToken = await this.blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
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
    const blackToken = await this.blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
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
