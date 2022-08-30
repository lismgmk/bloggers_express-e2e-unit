import { Router } from 'express';
import { checkIpServiceUser, authValidator, authController, checkTokenService } from '../inversify.config';

export const authRouter = Router({});

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
