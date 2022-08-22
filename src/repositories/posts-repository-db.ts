import mongoose from 'mongoose';
import { collections } from '../connect-db';
import { Likes } from '../models/likesModel';
import { Posts } from '../models/postsModel';
import { IPosts } from '../types';

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
  async createPost(bodyParams: IPosts, bloggerId?: string) {
    const likeId = new mongoose.Types.ObjectId();
    const postId = new mongoose.Types.ObjectId();
    const likeInfo = new Likes({
      _id: likeId,
      postId,
      commentId: null,
      myStatus: 'None',
      addedAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    });
    const newPost = new Posts({
      _id: postId,
      ...bodyParams,
      bloggerId: bodyParams.bloggerId ? bodyParams.bloggerId : bloggerId,
      extendedLikesInfo: likeId,
    });

    try {
      await Likes.create(likeInfo);
      const createdPost = await Posts.create(newPost);
      const resCreatedPost = await createdPost.populate([
        { path: 'extendedLikesInfo', options: { lean: true } },
        { path: 'bloggerId', select: '_id name', options: { lean: true } },
      ]);

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
  async getPostById(id: string): Promise<IPosts | undefined> {
    const post = (await collections.posts?.findOne({ id })) as unknown as IPosts;
    return post;
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
