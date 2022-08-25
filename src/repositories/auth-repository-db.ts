import bcrypt from 'bcryptjs';
import { expiredAccess } from '../constants';
import { Users } from '../models/usersModel';
import { addUserAttempt } from '../utils/add-user-attempt';
import { jwtPassService } from '../utils/jwt-pass-service';
import { usersRepositoryDB } from './users-repository-db';

export const authRepositoryDB = {
  async authUser(login: string, password: string): Promise<{ accessToken: string } | null> {
    const attemptCountUser = await Users.findOne({ 'accountData.userName': login }).exec();
    const isMatch =
      attemptCountUser && (await bcrypt.compare(password, attemptCountUser.accountData.passwordHash ?? ''));
    if (!attemptCountUser || !isMatch) {
      await addUserAttempt.addAttemptByLogin(login, false);
      return null;
    } else {
      await addUserAttempt.addAttemptByLogin(login, true);
      const accessToken = jwtPassService.createJwt(attemptCountUser!._id!, expiredAccess);
      return { accessToken };
    }
  },
  async confirmEmail(code: string) {
    const confirmedUser = await Users.findOne({ 'emailConfirmation.confirmationCode': { $eq: code } }).exec();
    if (!confirmedUser) {
      return false;
    }
    if (confirmedUser!.emailConfirmation.isConfirmed === true) {
      return false;
    } else {
      await usersRepositoryDB.confirmUserById(confirmedUser!._id, true);
      return true;
    }
  },
};
