import { collections } from '../connect-db';

export const addUserAttempt = {
  async addAttemptByLogin(login: string, restoreFlag: boolean) {
    await collections.users?.find({ 'accountData.userName': login }).forEach((doc) => {
      const oldAttemptCount = doc.emailConfirmation.attemptCount;
      collections.users?.updateOne(
        { 'accountData.userName': login },
        { $set: { 'emailConfirmation.attemptCount': restoreFlag ? 1 : oldAttemptCount + 1 } },
      );
    });
  },
};
