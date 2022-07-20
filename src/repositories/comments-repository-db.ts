import { collections } from '../connect-db';
import { ICommentsRes, IPaginationResponse } from '../types';
import { ObjectId } from 'mongodb';

export const commentsRepositoryDb = {
  async getAllComments(pageSize: number, pageNumber: number): Promise<IPaginationResponse<ICommentsRes>> {
    let commentsPortion: ICommentsRes[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    commentsPortion = await collections.comments
      ?.find()
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize)
      .toArray();
    totalCount = await collections.comments?.find().count();
    totalPages = Math.ceil((totalCount || 0) / pageSize);
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: commentsPortion!.map((el) => {
        return resComment(el);
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

  async updateComment(content: string, login: string) {
    await collections.comments?.updateOne({ userLogin: login }, { $set: { content } });
  },
  async getCommentById(id: string) {
    const comment = await collections.comments?.findOne({ _id: new ObjectId(id) });
    return comment ? resComment(comment) : comment;
  },

  async deleteComment(id: string) {
    const result = await collections.comments?.deleteOne({ _id: new ObjectId(id) });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};

const resComment = (el: ICommentsRes) => {
  return {
    id: el._id!.toString(),
    content: el.content,
    userLogin: el.userLogin,
    userId: el.userId,
    addedAt: el.addedAt,
  };
};
