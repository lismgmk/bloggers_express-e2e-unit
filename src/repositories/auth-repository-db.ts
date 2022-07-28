import { collections } from '../connect-db';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { addUserAttempt } from '../utils/add-user-attempt';

export const authRepositoryDB = {
  async authUser(login: string, password: string): Promise<{ token: string } | 'add attempt' | 'max limit'> {
    const attemptCountUser = await collections.users?.findOne({ 'accountData.userName': login });
    const isMatch =
      attemptCountUser && (await bcrypt.compare(password, attemptCountUser.accountData.passwordHash ?? ''));
    if (!attemptCountUser || !isMatch) {
      await addUserAttempt.addAttemptByLogin(login, false);
      return 'add attempt';
    }
    if (attemptCountUser!.emailConfirmation.attemptCount > 5) {
      return 'max limit';
    } else {
      await addUserAttempt.addAttemptByLogin(login, true);
      const accessToken = JWT.sign({ id: attemptCountUser._id!.toString() }, process.env.ACCESS_TOKEN_SECRET ?? '');
      return { token: accessToken };
    }
  },
  async confirmEmail(code: string) {
    const confirmedUser = await collections.users?.findOne({ 'emailConfirmation.confirmationCode': { $eq: code } });
    if (!confirmedUser) {
      return false;
    }
    if (confirmedUser!.emailConfirmation.isConfirmed === true) {
      return false;
    } else {
      await collections.users?.updateOne(
        { _id: confirmedUser!._id },
        { $set: { 'emailConfirmation.isConfirmed': true, 'emailConfirmation.attemptCount': 0 } },
      );
      return true;
    }
  },
};
