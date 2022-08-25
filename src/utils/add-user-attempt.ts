import { Users } from '../models/usersModel';

export const addUserAttempt = {
  async addAttemptByLogin(login: string, restoreFlag: boolean) {
    try {
      const filter = { 'accountData.userName': login };
      const update = { $inc: { 'emailConfirmation.attemptCount': restoreFlag ? 0 : 1 } };
      await Users.findOneAndUpdate(filter, update).exec();
    } catch (err) {
      return err;
    }
  },
};
