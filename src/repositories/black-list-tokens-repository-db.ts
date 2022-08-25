import { BlackList } from '../models/blackListModel';

export const blackListTokensRepositoryDB = {
  async addToken(token: string) {
    try {
      return await BlackList.create({ tokenValue: token });
    } catch (err) {
      return `Db error: ${err}`;
    }
  },
  async checkToken(token: string) {
    const blackToken = await BlackList.findOne({ tokenValue: token }).exec();
    return blackToken;
  },
};
