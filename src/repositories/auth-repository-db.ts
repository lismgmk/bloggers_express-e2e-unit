import { collections } from '../connect-db';
import { UsersModel } from '../models/bloggers';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

export const authRepositoryDB = {
  async authUser(login: string, password: string): Promise<{ token: string } | 'error'> {
    const user = (await collections.users?.findOne({ login })) as UsersModel;
    if (!user) {
      return 'error';
    }
    const isMatch = await bcrypt.compare(password, user.hashPassword ?? '');
    if (!isMatch) {
      return 'error';
    }
    const accessToken = JWT.sign({ login }, process.env.ACCESS_TOKEN_SECRET ?? '');

    return { token: accessToken };
  },
};
