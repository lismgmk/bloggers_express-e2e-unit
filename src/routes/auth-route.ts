import { Router } from 'express';
import { CheckIpServiceUser } from '../application/check-ip-service';
import { CheckTokenService } from '../application/check-token-service';
import { AuthController } from '../controllers/auth-controller';
import { container } from '../inversify.config';
import { AuthValidator } from '../validators/auth-validator';
import 'reflect-metadata';

export const authRouter = Router({});

const checkTokenService = container.resolve(CheckTokenService);
const checkIpServiceUser = container.resolve(CheckIpServiceUser);
const authValidator = container.resolve(AuthValidator);
const authController = container.resolve(AuthController);

authRouter.post(
  '/login',
  checkIpServiceUser.ipStatus.bind(checkIpServiceUser),
  authValidator.login.bind(authValidator),
  authController.login.bind(authController),
);

authRouter.post(
  '/registration',
  checkIpServiceUser.ipStatus.bind(checkIpServiceUser),
  authValidator.registration.bind(authValidator),
  authController.registration.bind(authController),
);

authRouter.post(
  '/registration-email-resending',
  checkIpServiceUser.ipStatus.bind(checkIpServiceUser),
  authValidator.registrationEmailResending.bind(authValidator),
  authController.registrationEmailResending.bind(authController),
);

authRouter.post(
  '/registration-confirmation',
  checkIpServiceUser.ipStatus.bind(checkIpServiceUser),
  authValidator.registrationConfirmation.bind(authValidator),
  authController.registrationConfirmation.bind(authController),
);

authRouter.post(
  '/refresh-token',
  checkTokenService.refreshToken.bind(checkTokenService),
  authController.getRefreshAccessToken.bind(authController),
);

authRouter.post(
  '/logout',
  checkTokenService.refreshToken.bind(checkTokenService),
  authController.logout.bind(authController),
);

authRouter.get('/me', checkTokenService.accessToken.bind(checkTokenService), authController.me.bind(authController));
