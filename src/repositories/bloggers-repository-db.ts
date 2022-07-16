import { collections } from '../connect-db';
import { Bloggers, Posts } from '../models/bloggers';
import { IBloggers, IPaginationResponse } from '../types';

export const bloggersRepositoryDB = {
  async getAllBloggers(
    pageSize: number,
    pageNumber: number,
    bloggerNamePart: string,
  ): Promise<IPaginationResponse<Bloggers>> {
    let bloggersPortion: Bloggers[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const namePart = new RegExp(bloggerNamePart);
    const allBloggers = await collections.bloggers?.find({ name: namePart });
    if (allBloggers) {
      bloggersPortion = await collections.bloggers
        ?.find(
          { name: namePart },
          {
            projection: {
              _id: 0,
            },
          },
        )
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .toArray();
      totalCount = await collections.bloggers?.find({ name: namePart }).count();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: bloggersPortion,
    };
  },
  async getAllPostsBloggers(
    pageSize: number,
    pageNumber: number,
    bloggerId: number,
  ): Promise<IPaginationResponse<Posts>> {
    let postsPortion: Posts[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const allBloggersPosts = await collections.posts?.find({ bloggerId });
    if (allBloggersPosts) {
      postsPortion = await collections.posts
        ?.find(
          { bloggerId },
          {
            projection: {
              _id: 0,
            },
          },
        )
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .toArray();
      totalCount = await collections.posts?.find({ bloggerId }).count();
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

  async createBlogger(name: string, youtubeUrl: string): Promise<IBloggers> {
    const newBlogger: Bloggers = {
      id: +new Date(),
      name,
      youtubeUrl,
    };
    await collections.bloggers?.insertOne(newBlogger);
    delete newBlogger._id;
    return newBlogger;
  },
  async getBloggerById(id: number) {
    const blogger = (await collections.bloggers?.findOne({ id })) as Bloggers;
    blogger && delete blogger._id;
    return blogger;
  },
  async upDateBlogger(name: string, youtubeUrl: string, id: number) {
    await collections.bloggers?.updateOne({ id: id }, { $set: { name, youtubeUrl } });
  },
  async deleteBlogger(id: number) {
    const result = await collections.bloggers?.deleteOne({ id: id });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
  },
};
