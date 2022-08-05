import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { errorFormatter } from '../utils/error-util';
import { authRepositoryDB } from '../repositories/auth-repository-db';
import requestIp from 'request-ip';
import { usersRepositoryDB } from '../repositories/users-repository-db';
import { mailService } from '../utils/mail-service';
import { v4 as uuidv4 } from 'uuid';
import { checkIpServiceUser } from '../application/check-ip-service';
import { checkRefreshTokenService } from '../application/check-refresh-token-service';
import { jwtPassService } from '../utils/jwt-pass-service';
import { blackListTokensRepositoryDB } from '../repositories/black-list-tokens-repository-db';
import { checkAccessTokenService } from '../application/check-access-token-service';
import { expiredAccess, expiredRefresh } from '../constants';

export const authRouter = Router({});
authRouter.post(
  '/login',
  checkIpServiceUser,
  body('login').trim().isLength({ min: 3, max: 10 }).exists().withMessage('invalid length'),
  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),

  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    const isCheck = await authRepositoryDB.authUser(req.body.login, req.body.password);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    if (!isCheck) {
      return res.send(401);
    } else {
      const user = await usersRepositoryDB.getUserByLogin(req.body.login);
      const refreshToken = jwtPassService.createJwt(user!._id.toString(), expiredRefresh);
      return res
        .cookie('refreshToken', refreshToken, {
          httpOnly: true,
        })
        .status(200)
        .send(isCheck);
    }
  },
);

authRouter.post(
  '/registration',
  checkIpServiceUser,
  body('login')
    .trim()
    .isLength({ min: 3, max: 10 })
    .bail()
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByLogin(value).then((user) => {
        if (user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('invalid value'),

  body('password').trim().isLength({ min: 6, max: 20 }).exists().withMessage('invalid length'),
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByEmail(value).then((user) => {
        if (user) {
          return Promise.reject();
        }
      });
    })
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    const userIp = requestIp.getClientIp(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }

    const confirmationCode = uuidv4();

    await usersRepositoryDB.createUser(req.body.login, req.body.password, req.body.email, userIp!, confirmationCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, confirmationCode);
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
    } else {
      return res.status(204).send(isSendStatus.data);
    }
  },
);

authRouter.post(
  '/registration-email-resending',
  checkIpServiceUser,
  body('email')
    .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .exists()
    .bail()
    .custom(async (value) => {
      return usersRepositoryDB.getUserByEmail(value).then((user) => {
        if (!user || user!.emailConfirmation.isConfirmed === true) {
          return Promise.reject();
        }
      });
    })
    .withMessage(
      "The field Email must match the regular expression '^[\\\\w-\\\\.]+@([\\\\w-]+\\\\.)+[\\\\w-]{2,4}$'.",
    ),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    }
    const newCode = uuidv4();
    await usersRepositoryDB.updateCodeByEmail(req.body.email, newCode);
    const isSendStatus = await mailService.sendEmail(req.body.email, newCode);
    if (isSendStatus.error) {
      const createdUser = await usersRepositoryDB.deleteUserByLogin(req.body.login);
      return res.status(400).send(createdUser.deleteCount === 1 ? isSendStatus.data : 'failed delete user');
    } else {
      return res.send(204);
    }
    // }
  },
);

authRouter.post(
  '/registration-confirmation',
  checkIpServiceUser,
  body('code')
    .exists()
    .bail()
    .custom(async (value) => {
      return authRepositoryDB.confirmEmail(value).then((user) => {
        if (!user) {
          return Promise.reject();
        }
      });
    })
    .withMessage('code error'),
  async (req, res) => {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      return res.send(204);
    }
  },
);

authRouter.post('/refresh-token', checkRefreshTokenService, async (req, res) => {
  const accessToken = jwtPassService.createJwt(req.user!.toString(), expiredAccess);
  const refreshToken = jwtPassService.createJwt(req.user!.toString(), expiredRefresh);
  await blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
  return res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
    })
    .status(200)
    .send({ accessToken });
});

authRouter.post('/logout', checkRefreshTokenService, async (req, res) => {
  await blackListTokensRepositoryDB.addToken(req.cookies.refreshToken);
  await usersRepositoryDB.confirmUserById(req.user!._id!.toString(), false);
  return res.sendStatus(204);
});

authRouter.get('/me', checkAccessTokenService, async (req, res) => {
  return res.status(200).send({
    email: req.user!.accountData.email,
    login: req.user!.accountData.userName,
    userId: req.user!._id!.toString(),
  });
});
