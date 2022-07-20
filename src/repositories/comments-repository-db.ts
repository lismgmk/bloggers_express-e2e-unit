import { collections } from '../connect-db';
import { UsersModel } from '../models/bloggers';
import { ICommentsRes, IPaginationResponse } from '../types';
import { ObjectId } from 'mongodb';

export const commentsRepositoryDb = {
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

  async createComment(content: string, login: string): Promise<ICommentsRes> {
    const userId = await collections.users?.findOne({ login });
    const newComment: ICommentsRes = {
      content,
      userId: userId!._id.toString(),
      userLogin: login,
      addedAt: new Date(),
    };
    const insertComment = await collections.comments?.insertOne(newComment);
    newComment.id = insertComment!.insertedId.toString();
    delete newComment._id;
    return newComment;
  },

  async getUserById(id: string) {
    return await collections.users?.findOne({ _id: new ObjectId(id) });
  },

  async deleteUser(id: string) {
    const result = await collections.users?.deleteOne({ _id: new ObjectId(id) });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};
