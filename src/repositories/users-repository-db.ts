import { collections } from '../connect-db';
import { UsersModel } from '../models/bloggers';
import { IPaginationResponse, IUsersRes } from '../types';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export const usersRepositoryDB = {
  async getAllUsers(pageSize: number, pageNumber: number): Promise<IPaginationResponse<UsersModel>> {
    let usersPortion: UsersModel[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    usersPortion = await collections.users
      ?.find()
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize)
      .toArray();
    totalCount = await collections.users?.find().count();
    totalPages = Math.ceil((totalCount || 0) / pageSize);
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items:
        usersPortion &&
        usersPortion.map((el) => {
          return { id: el._id, login: el.login };
        }),
    };
  },

  async createUser(login: string, password: string): Promise<IUsersRes> {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser: UsersModel = {
      login,
      hashPassword,
    };
    const insertUser = await collections.users?.insertOne(newUser);
    return { login, id: insertUser!.insertedId.toString() };
  },

  async getUserById(id: string) {
    return await collections.users?.findOne({ _id: new ObjectId(id) });
  },

  async deleteUser(id: string) {
    const result = await collections.users?.deleteOne({ _id: new ObjectId(id) });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};
