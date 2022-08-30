import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { add } from 'date-fns';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { Users } from '../models/usersModel';
import { IPaginationResponse, IUsersRes } from '../types';

@injectable()
export class UsersRepositoryDB {
  async getAllUsers(
    pageSize: number,
    pageNumber: number,
  ): Promise<IPaginationResponse<{ id: ObjectId; login: string }>> {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const usersPortion = (
      await Users.find({})
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .lean()
    ).map((i) => {
      return { id: i._id, login: i.accountData.userName };
    });
    totalCount = await Users.find({}).count().lean();
    totalPages = Math.ceil((totalCount || 0) / pageSize);
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: usersPortion,
    };
  }

  async createUser(
    login: string,
    password: string,
    email: string,
    userIp: string,
    confirmationCode: string,
  ): Promise<IUsersRes | string> {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new Users({
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
    });
    try {
      await Users.create(newUser);
      return { id: newUser._id.toString(), login: newUser.accountData.userName };
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await Users.findById(new ObjectId(id)).lean();
      return user;
    } catch (err) {
      return false;
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await Users.findOne({ 'accountData.email': { $eq: email } });
    } catch (err) {
      return false;
    }
  }

  async updateCodeByEmail(email: string, code: string) {
    try {
      return await Users.findOneAndUpdate(
        { 'accountData.email': { $eq: email } },
        { $set: { 'emailConfirmation.confirmationCode': code } },
      );
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getUserByLogin(login: string) {
    try {
      return await Users.findOne({ 'accountData.userName': { $eq: login } });
    } catch (err) {
      return false;
    }
  }

  async deleteUser(id: string) {
    try {
      return await Users.findByIdAndDelete(id);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async deleteUserByLogin(login: string) {
    try {
      return await Users.findOneAndDelete({ 'accountData.userName': login });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async confirmUserById(id: string | ObjectId, confirm: boolean) {
    try {
      return await Users.findByIdAndUpdate(id, {
        $set: { 'emailConfirmation.isConfirmed': confirm, 'emailConfirmation.attemptCount': 0 },
      });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async confirmUserByLogin(login: string) {
    try {
      return await Users.findOneAndUpdate(
        { 'accountData.userName': login },
        { $set: { 'emailConfirmation.isConfirmed': true, 'emailConfirmation.attemptCount': 0 } },
      );
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
