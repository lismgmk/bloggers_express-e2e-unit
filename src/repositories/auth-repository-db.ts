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
  async addAttemptIp(login: string, userIp: string): Promise<'new user' | 'add attempt' | 'max limit'> {
    const attemptCountUser = await collections.users?.findOne({ 'accountData.userName': login });
    if (!attemptCountUser) {
      return 'new user';
    }
    if (attemptCountUser!.emailConfirmation.attemptCount > 5) {
      return 'max limit';
    } else {
      // if (attemptCountUser!.accountData.userIp === userIp) {
      await collections.users?.find({ 'accountData.userName': login }).forEach((doc) => {
        const oldAttemptCount = doc.emailConfirmation.attemptCount;
        collections.users?.updateOne(
          { 'accountData.userName': login },
          { $set: { 'emailConfirmation.attemptCount': oldAttemptCount + 1 } },
        );
      });
      return 'add attempt';
    }
  },
  async checkIpAttempt(userIp: string) {
    const attemptCountUserIp = await collections.ipUsers?.findOne({ userIp });
    console.log(new Date().getSeconds() - attemptCountUserIp!.createdAt.getSeconds(), 'ddddddddddddddddddddddddddd');
    if (!attemptCountUserIp) {
      return await collections.ipUsers?.insertOne({ createdAt: new Date(), userIp, attempt: 1 });
    }
    if (
      attemptCountUserIp &&
      // attemptCountUserIp.attempt < 5 &&
      new Date().getSeconds() - attemptCountUserIp.createdAt.getSeconds() > 10
    ) {
      return await collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: 1, createdAt: new Date() } });
    }
    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt >= 5 &&
      attemptCountUserIp.createdAt.getSeconds() - new Date().getSeconds() < 10
    ) {
      return 'error';
    }

    if (
      attemptCountUserIp &&
      attemptCountUserIp.attempt < 5 &&
      attemptCountUserIp.createdAt.getSeconds() - new Date().getSeconds() < 10
    ) {
      await collections.ipUsers?.find({ userIp }).forEach((doc) => {
        const oldAttemptCount = doc.attempt;
        collections.ipUsers?.updateOne({ userIp }, { $set: { attempt: oldAttemptCount + 1 } });
      });
    }
  },
};
