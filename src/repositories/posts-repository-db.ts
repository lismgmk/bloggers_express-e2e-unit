import mongoose from 'mongoose';
import { collections } from '../connect-db';
import { Likes } from '../models/likesModel';
import { Posts } from '../models/postsModel';
import { IPosts, myStatus } from '../types';

export const postsRepositoryDB = {
  async getAllPosts(pageSize: number, pageNumber: number) {
    // async getAllPosts(pageSize: number, pageNumber: number): Promise<IPaginationResponse<IPostsResponse>> {
    let postsPortion: IPosts[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    console.log('!!!!!!!!!!!!');
    const allBloggersPosts = await Posts.find()
      .populate({
        path: 'Likes',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        match: (doc) => ({ likeId: doc.postId, commentId: { $ne: true } }),
        // match: { postId:  },
        // Explicitly exclude `_id`, see http://bit.ly/2aEfTdB
        // select: 'name -_id',
      })
      .lean();
    console.log(allBloggersPosts, 'allll!!');
    if (allBloggersPosts) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      postsPortion = await collections.posts
        ?.find(
          {},
          {
            projection: {
              _id: 0,
            },
          },
        )
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .toArray();
      totalCount = await collections.posts?.find().count();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: postsPortion,
    };
  },
  async createPost(bodyParams: IPosts) {
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
      extendedLikesInfo: likeId,
    });

    try {
      await Likes.create(likeInfo);
      const createdPost = await Posts.create(newPost);
      const resCreatedPost = await createdPost.populate([
        { path: 'extendedLikesInfo', options: { lean: true } },
        { path: 'bloggerId', select: '_id name', options: { lean: true } },
      ]);
      const result: any = { ...resCreatedPost.toJSON() };
      result.bloggerId = result.bloggerId._id;
      result.bloggerName = result.bloggerId.name;
      delete result.bloggerId;
      console.log(result, 'inserteeed!!!!!!!!!!!!!!');
      return result;
    } catch (err) {
      console.log(err);
      return `Fail in DB: ${err}`;
    }

    // const newPost: Omit<any, '_id'> = {
    //   id: (+new Date()).toString(),
    //   bloggerName: blogger!.name,
    //   ...bodyParams,
    // };
    // const insertPost = await collections.posts?.insertOne({ ...newPost });
    // if (insertPost) {
    //   return newPost;
    // }
  },
  async getPostById(id: string): Promise<IPosts | undefined> {
    const post = (await collections.posts?.findOne({ id })) as unknown as IPosts;
    // post && delete post._id;
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
