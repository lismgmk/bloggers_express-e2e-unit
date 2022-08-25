import { Types } from 'mongoose';
import { Comments } from '../models/commentsModel';
import { IUser, statusType } from '../types';
import { requestCommentZeroBuilder } from '../utils/request-comment-zero-builder';
import { requestObjCommentBuilder, ICommentsRequest } from '../utils/request-obj-comment-builder';
import { userStatusUtil } from '../utils/user-status-util';

export const commentsRepositoryDb = {
  async getAllComments(pageSize: number, pageNumber: number, validUser: IUser, postId: string) {
    try {
      let totalCount: number | undefined = 0;
      let totalPages = 0;
      const commentsPortion = await Promise.all(
        (
          await Comments.find({ postId })
            .populate({
              path: 'userId',
              select: ' _id accountData',
              options: { lean: true },
            })
            .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
            .limit(pageSize)
            .exec()
        ).map(async (el) => {
          const userStatus = await userStatusUtil(null, el._id, validUser);
          return await requestObjCommentBuilder({ ...el.toObject() }, userStatus);
        }),
      );
      totalCount = await Comments.findOne({ postId }).count().lean();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
      return {
        pagesCount: totalPages,
        page: pageNumber,
        pageSize,
        totalCount,
        items: commentsPortion,
      };
    } catch (err) {
      return err;
    }
  },

  async createComment(content: string, userId: Types.ObjectId, postId: Types.ObjectId) {
    const newComment = new Comments({
      content,
      userId,
      addedAt: new Date(),
      postId: postId,
    });
    try {
      const insertComment = await Comments.create(newComment);
      const resCreatedComment = await insertComment.populate({
        path: 'userId',
        select: ' _id accountData',
        options: { lean: true },
      });
      const result = {
        ...resCreatedComment.toObject(),
      };
      return requestCommentZeroBuilder(result);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  },

  async updateComment(content: string, id: string) {
    try {
      const update = {
        content,
      };
      return await Comments.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
    } catch (err) {
      return err;
    }
  },
  async checkCommentById(id: string) {
    const comment = await Comments?.findById(id).exec();
    return comment;
  },

  async getCommentById(commentId: string, userStatus: statusType) {
    const comment = await Comments.findById(commentId)
      .populate({
        path: 'userId',
        select: ' _id accountData',
        options: { lean: true },
      })
      .exec();
    if (comment) {
      const result = {
        ...comment.toObject(),
      };
      return await requestObjCommentBuilder(result as ICommentsRequest, userStatus);
    } else {
      return false;
    }
  },

  async deleteComment(id: string) {
    try {
      return await Comments.deleteOne({ _id: id });
    } catch (err) {
      return err;
    }
  },
};
