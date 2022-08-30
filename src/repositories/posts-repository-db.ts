import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { Posts } from '../models/postsModel';
import { IPosts, IReqPosts, statusType, IUser } from '../types';
import { requestObjPostCommentBuilder, IPostsRequest } from '../utils/request-obj-post-comment-builder';
import { requestObjZeroBuilder } from '../utils/request-obj-zero-builder';
import { userStatusUtil } from '../utils/user-status-util';

@injectable()
export class PostsRepositoryDB {
  async getAllPosts(pageSize: number, pageNumber: number, validUser: IUser, bloggerId?: string) {
    try {
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
          const userStatus = await userStatusUtil(el._id, null, validUser);
          return await requestObjPostCommentBuilder(el.toObject() as IPostsRequest, userStatus);
        }),
      );
      totalCount = await Posts.countDocuments({ bloggerId: bloggerId || { $exists: true } }).lean();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
      return {
        pagesCount: totalPages,
        page: pageNumber,
        pageSize,
        totalCount,
        items: allBloggersPosts,
      };
    } catch (err) {
      return err;
    }
  }
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

      const result = resCreatedPost.toObject();
      return requestObjZeroBuilder(result);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async checkPostById(postId: string) {
    return await Posts.findById(postId).exec();
  }

  async getPostById(postId: string, userStatus: statusType) {
    const post = await Posts.findById(postId)
      .populate([{ path: 'bloggerId', select: '_id name', options: { lean: true } }])
      .exec();
    if (post) {
      const result = post.toObject();
      return await requestObjPostCommentBuilder(result as IPostsRequest, userStatus);
    } else {
      return false;
    }
  }

  async upDatePost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>, id: string) {
    try {
      const update = {
        title: bodyParams.title,
        shortDescription: bodyParams.shortDescription,
        content: bodyParams.content,
        bloggerId: bodyParams.bloggerId,
      };
      return await Posts.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
    } catch (err) {
      return err;
    }
  }

  async deletePost(id: string) {
    try {
      return await Posts.deleteOne({ _id: id });
    } catch (err) {
      return err;
    }
  }
}
