import { Types } from 'mongoose';
import { collections } from '../connect-db';
import { Comments } from '../models/commentsModel';
import { IComments, IPaginationResponse } from '../types';
import { ObjectId } from 'mongodb';

export const commentsRepositoryDb = {
  async getAllComments(
    pageSize: number,
    pageNumber: number,
    postId: string,
  ): Promise<{
    pagesCount: number;
    pageSize: number;
    page: number;
    totalCount: number | undefined;
    items: {
      addedAt: Date | null | undefined;
      userId: Types.ObjectId | undefined;
      content: string | null | undefined;
    }[];
  }> {
    let commentsPortion: IComments[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    commentsPortion = await Comments.find({ postId })
      .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
      .limit(pageSize)
      .lean();
    totalCount = await collections.comments?.find({ postId }).count();
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

  async createComment(content: string, userId: Types.ObjectId, postId: Types.ObjectId) {
    // async createComment(content: string, userId: Types.ObjectId, postId: Types.ObjectId): Promise<IComments> {
    const existedUser = await collections.users?.findOne({ _id: new ObjectId(userId) });
    // const newComment: IComments = {
    const newComment = {
      content,
      userId,
      // userLogin: existedUser!.accountData.userName,
      addedAt: new Date(),
      postId: postId,
    };
    const insertComment = await collections.comments?.insertOne(newComment);
    // newComment.id = insertComment!.insertedId.toString();
    // delete newComment._id;
    // delete newComment.postId;
    return newComment;
  },

  async updateComment(content: string, id: string) {
    await collections.comments?.updateOne({ _id: new ObjectId(id) }, { $set: { content } });
  },
  async getCommentById(id: string) {
    const comment = await collections.comments?.findOne({ _id: new ObjectId(id) });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return comment ? resComment(comment) : comment;
  },

  async deleteComment(id: string) {
    const result = await collections.comments?.deleteOne({ _id: new ObjectId(id) });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};

const resComment = (el: IComments) => {
  return {
    // id: el._id!.toString(),
    content: el.content,
    // userLogin: el.userLogin,
    userId: el.userId,
    addedAt: el.addedAt,
  };
};
