import { collections } from '../connect-db';
import { UsersModel } from '../models/bloggers';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

export const authRepositoryDB = {
  async authUser(login: string, password: string): Promise<{ token: string } | 'error'> {
    const user = (await collections.users?.findOne({ login })) as UsersModel;
    if (!user) {
      return 'error';
    } else {
      const isMatch = await bcrypt.compare(password, user.hashPassword ?? '');
      if (!isMatch) {
        return 'error';
      } else {
        const accessToken = JWT.sign({ id: user._id!.toString() }, process.env.ACCESS_TOKEN_SECRET ?? '');
        return { token: accessToken };
      }
    }
  },
  async confirmEmail(code: string) {
    const confirmedUser = await collections.users?.findOne({ 'emailConfirmation.confirmationCode': { $eq: code } });
    if (confirmedUser) {
      await collections.users?.updateOne(
        { _id: confirmedUser._id },
        { $set: { 'emailConfirmation.isConfirmed': true } },
      );
      return true;
    } else {
      return false;
    }
  },
};
