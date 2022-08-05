import { collections } from '../connect-db';

export const blackListTokensRepositoryDB = {
  async addToken(token: string): Promise<boolean> {
    try {
      const isAddedToke = await collections.black_list_tokens?.insertOne({ tokenValue: token });
      return isAddedToke!.acknowledged;
    } catch (e) {
      return false;
    }
  },
  async deleteToken(token: string): Promise<boolean> {
    try {
      const isAddedToke = await collections.black_list_tokens?.deleteOne({ tokenValue: token });
      return isAddedToke!.acknowledged;
    } catch (e) {
      return false;
    }
  },
  async checkToken(token: string) {
    return await collections.black_list_tokens?.findOne({ tokenValue: token });
  },
};
