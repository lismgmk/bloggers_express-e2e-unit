import { collections } from '../connect-db';
import { Posts } from '../models/bloggers';
import { IPaginationResponse, IPosts } from '../types';

export const postsRepositoryDB = {
  async getAllPosts(pageSize: number, pageNumber: number): Promise<IPaginationResponse<Posts>> {
    let postsPortion: Posts[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const allBloggersPosts = await collections.posts?.find();
    if (allBloggersPosts) {
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
  async createPost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>): Promise<Omit<Posts, '_id'> | undefined> {
    const newPost: Omit<Posts, '_id'> = {
      id: new Date().toString(),
      bloggerName: `blogger${new Date().toString()}`,
      ...bodyParams,
    };
    const insertPost = await collections.posts?.insertOne({ ...newPost });
    if (insertPost) {
      return newPost;
    }
  },
  async getPostById(id: string): Promise<Posts | undefined> {
    const post = (await collections.posts?.findOne({ id })) as unknown as Posts;
    post && delete post._id;
    return post;
  },
  async upDatePost(bodyParams: Omit<IPosts, 'id' | 'bloggerName'>, id: string) {
    const newPost: Omit<Posts, '_id'> = {
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
