import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { JwtPassService } from '../utils/jwt-pass-service';
import { expiredAccess } from '../variables';
import { Users } from '../models/usersModel';
import { UsersRepositoryDB } from './users-repository-db';

@injectable()
export class AuthRepositoryDB {
  constructor(
    @inject(UsersRepositoryDB) protected usersRepositoryDB: UsersRepositoryDB,
    @inject(JwtPassService) protected jwtPassService: JwtPassService,
  ) {}

  async authUser(login: string, password: string): Promise<{ accessToken: string } | null> {
    const existentUser = await Users.findOne({ 'accountData.userName': login }).exec();
    let isMatch = false;
    if (existentUser) {
      isMatch = await this.jwtPassService.checkPassBcrypt(password, existentUser.accountData.passwordHash ?? '');
    }
    if (!existentUser || !isMatch) {
      await this.usersRepositoryDB.addAttemptByLogin(login, false);
      return null;
    } else {
      await this.usersRepositoryDB.addAttemptByLogin(login, true);
      const accessToken = this.jwtPassService.createJwt(existentUser!._id!, expiredAccess);
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
