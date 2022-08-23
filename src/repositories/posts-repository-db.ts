import mongoose from 'mongoose';
import { collections } from '../connect-db';
import { Likes } from '../models/likesModel';
import { Posts } from '../models/postsModel';
import { IPosts, IReqPosts } from '../types';

export const postsRepositoryDB = {
  async getAllPosts(pageSize: number, pageNumber: number, bloggerId?: string) {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const allBloggersPosts = (
      await Posts.find({ bloggerId: bloggerId || { $exists: true } })
        .populate([
          { path: 'extendedLikesInfo', options: { lean: true } },
          { path: 'bloggerId', select: '_id name', options: { lean: true } },
        ])
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .lean()
    ).map((el) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el.bloggerName = el.bloggerId.name;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      el.bloggerId = el.bloggerId._id;
      return el;
    });
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
        ...resCreatedPost.toJSON(),
      };
      result.bloggerName = result.bloggerId.name;
      result.bloggerId = result.bloggerId._id;
      return result;
    } catch (err) {
      console.log(err);
      return `Fail in DB: ${err}`;
    }
  },
  async getPostById(postId: string, userStatus?: string) {
    const post = await Posts.findById(postId)
      .populate([{ path: 'bloggerId', select: '_id name', options: { lean: true } }])
      .exec();
    if (post) {
      const result = {
        ...post.toObject(),
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.bloggerName = result.bloggerId.name;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.bloggerId = result.bloggerId._id;
      const dislikesCount = await Likes.find({ postId, myStatus: 'Dislike' }).exec();
      const likesCount = await Likes.find({ postId, myStatus: 'Like' }).sort({ date: -1 }).exec();
      const newestLikes = likesCount.slice(0, 2).map((el) => {
        return {
          addedAt: el.addedAt,
          userId: el.userId,
          login: el.login,
        };
      });
      result.extendedLikesInfo = {
        dislikesCount: dislikesCount.length,
        likesCount: likesCount.length,
        myStatus: userStatus,
        newestLikes,
      };
      return result;
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
