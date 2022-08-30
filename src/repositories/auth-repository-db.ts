import bcrypt from 'bcryptjs';
import { injectable, inject } from 'inversify';
import { expiredAccess } from '../variables';
import { Users } from '../models/usersModel';
import { addUserAttempt } from '../utils/add-user-attempt';
import { jwtPassService } from '../utils/jwt-pass-service';
import { UsersRepositoryDB } from './users-repository-db';

@injectable()
export class AuthRepositoryDB {
  constructor(@inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB) {}

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
  }
  async confirmEmail(code: string) {
    const confirmedUser = await Users.findOne({ 'emailConfirmation.confirmationCode': { $eq: code } }).exec();
    if (!confirmedUser) {
      return false;
    }
    if (confirmedUser!.emailConfirmation.isConfirmed === true) {
      return false;
    } else {
      await this.usersRepositoryDB.confirmUserById(confirmedUser!._id, true);
      return true;
    }
  }
}
