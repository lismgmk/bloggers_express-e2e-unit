import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { Comments } from '../models/commentsModel';
import { IUser, statusType } from '../types';
import { RequestBuilder, ICommentsRequest } from '../utils/request-posts-comments';
import { userStatusUtil } from '../utils/user-status-util';

@injectable()
export class CommentsRepositoryDb {
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
          const comment = new RequestBuilder(null, el.toObject(), userStatus);
          return await comment.commentObj();
        }),
      );
      totalCount = await Comments.countDocuments({ postId }).lean();
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
  }

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
      const result = resCreatedComment.toObject();
      const newObjComment = new RequestBuilder(null, result as ICommentsRequest);
      return await newObjComment.commentObj();
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async updateComment(content: string, id: string) {
    try {
      const update = {
        content,
      };
      return await Comments.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
    } catch (err) {
      return err;
    }
  }

  async checkCommentById(id: string) {
    const comment = await Comments?.findById(id).exec();
    return comment;
  }

  async getCommentById(commentId: string, userStatus: statusType) {
    const comment = await Comments.findById(commentId)
      .populate({
        path: 'userId',
        select: ' _id accountData',
        options: { lean: true },
      })
      .exec();
    if (comment) {
      const result = comment.toObject();
      const newObjComment = new RequestBuilder(null, result as ICommentsRequest);
      return await newObjComment.commentObj();
    } else {
      return false;
    }
  }

  async deleteComment(id: string) {
    try {
      return await Comments.deleteOne({ _id: id });
    } catch (err) {
      return err;
    }
  }
}
