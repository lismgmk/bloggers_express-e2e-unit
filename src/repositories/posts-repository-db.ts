import mongoose from 'mongoose';
import { collections } from '../connect-db';
import { Posts } from '../models/postsModel';
import { IPosts, IReqPosts, statusType, IUser } from '../types';
import { requestObjPostCommentBuilder, IPostsRequest } from '../utils/request-obj-post-comment-builder';
import { requestObjZeroBuilder } from '../utils/request-obj-zero-builder';
import { userStatusUtil } from '../utils/user-status-util';

export const postsRepositoryDB = {
  async getAllPosts(pageSize: number, pageNumber: number, validUser: IUser, bloggerId?: string) {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const allBloggersPosts = await Promise.all(
      (
        await Posts.find({ bloggerId: bloggerId || { $exists: true } })
          .populate([{ path: 'bloggerId', select: '_id name', options: { lean: true } }])
          .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
          .limit(pageSize)
          .exec()
      ).map(async (el) => {
        const userStatus = await userStatusUtil(el._id, validUser);
        return await requestObjPostCommentBuilder(
          {
            ...el.toObject(),
          } as IPostsRequest,
          userStatus,
        );
      }),
    );
    totalCount = await Posts.find({ bloggerId: bloggerId || { $exists: true } })
      .count()
      .lean();
    totalPages = Math.ceil((totalCount || 0) / pageSize);
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: allBloggersPosts,
    };
  },
  async createPost(bodyParams: IReqPosts, bloggerId?: string) {
    const postId = new mongoose.Types.ObjectId();
    const bloggerIdParam = bloggerId
      ? new mongoose.Types.ObjectId(bloggerId)
      : new mongoose.Types.ObjectId(bodyParams.bloggerId);

    const newPost = new Posts({
      _id: postId,
      title: bodyParams.title,
      content: bodyParams.content,
      shortDescription: bodyParams.shortDescription,
      bloggerId: bloggerIdParam,
      addedAt: new Date(),
    });

    try {
      const createdPost = await Posts.create(newPost);
      const resCreatedPost = await createdPost.populate({
        path: 'bloggerId',
        select: '_id name',
        options: { lean: true },
      });

      const result = {
        ...resCreatedPost.toObject(),
      };
      return requestObjZeroBuilder(result);
    } catch (err) {
      console.log(err);
      return `Fail in DB: ${err}`;
    }
  },

  async checkPostById(postId: string) {
    return await Posts.findById(postId).exec();
  },

  async getPostById(postId: string, userStatus: statusType) {
    const post = await Posts.findById(postId)
      .populate([{ path: 'bloggerId', select: '_id name', options: { lean: true } }])
      .exec();
    if (post) {
      const result = {
        ...post.toObject(),
      };
      return await requestObjPostCommentBuilder(result as IPostsRequest, userStatus);
    } else {
      return false;
    }
  },

  async upDatePost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>, id: string) {
    const newPost: any = {
      title: bodyParams.title,
      shortDescription: bodyParams.shortDescription,
      content: bodyParams.content,
      bloggerId: bodyParams.bloggerId,
    };
    await collections.posts?.updateOne({ id }, { $set: newPost });
  },
  async deletePost(id: string) {
    const result = await collections.posts?.deleteOne({ id: id });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};
