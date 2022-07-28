import { collections } from '../connect-db';
import { IPaginationResponse, IUser, IUsersRes } from '../types';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';

export const usersRepositoryDB = {
  async getAllUsers(
    pageSize: number,
    pageNumber: number,
  ): Promise<IPaginationResponse<{ id: ObjectId; login: string }>> {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const usersPortion = await collections.users
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
          return { id: el._id, login: el.accountData.userName };
        }),
    };
  },

  async createUser(
    login: string,
    password: string,
    email: string,
    userIp: string,
    confirmationCode: string,
  ): Promise<IUsersRes> {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = {
      accountData: {
        userName: login,
        email,
        passwordHash: hashPassword,
        createdAt: new Date(),
        userIp,
      },
      emailConfirmation: {
        confirmationCode,
        expirationDate: add(new Date(), {
          hours: 1,
          minutes: 10,
        }),
        isConfirmed: false,
        attemptCount: 0,
      },
    };
    const insertUser = await collections.users?.insertOne(newUser);
    return { login: newUser.accountData.userName, id: insertUser!.insertedId.toString() };
  },

  async getUserById(id: string) {
    return await collections.users?.findOne({ _id: new ObjectId(id) });
  },
  async getUserByEmail(email: string) {
    return await collections.users?.findOne({ 'accountData.email': email });
  },
  async updateCodeByEmail(email: string, code: string) {
    return await collections.users?.updateOne(
      { 'accountData.email': { $eq: email } },
      { $set: { 'emailConfirmation.confirmationCode': code } },
    );
  },
  async getUserByLogin(login: string) {
    return await collections.users?.findOne({ 'accountData.userName': login });
  },

  async deleteUser(id: string) {
    const result = await collections.users?.deleteOne({ _id: new ObjectId(id) });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
  async deleteUserByLogin(login: string) {
    const result = await collections.users?.deleteOne({ 'accountData.userName': login });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};
