import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { Posts } from '../models/postsModel';
import { IPosts, IReqPosts, statusType, IUser } from '../types';
import { RequestBuilder, IPostsRequest } from '../utils/request-posts-comments';
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
          const post = new RequestBuilder(el.toObject(), null, userStatus);
          return await post.postObj();
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
      const newObjPost = new RequestBuilder(result as IPostsRequest, null);
      return await newObjPost.postObj();
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
      const postObj = new RequestBuilder(result as IPostsRequest, null, userStatus);
      return await postObj.postObj();
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
