import 'reflect-metadata';
import { injectable } from 'inversify';
import { BlackList } from '../models/blackListModel';

@injectable()
export class BlackListTokensRepositoryDB {
  async addToken(token: string) {
    try {
      return await BlackList.create({ tokenValue: token });
    } catch (err) {
      return `Db error: ${err}`;
    }
  }
  async checkToken(token: string) {
    try {
      return await BlackList.findOne({ tokenValue: token }).exec();
    } catch (err) {
      return `Db error: ${err}`;
    }
  }
}
