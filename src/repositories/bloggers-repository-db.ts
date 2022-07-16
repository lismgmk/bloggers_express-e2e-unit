import { collections } from '../connect-db';
import { Bloggers, Posts } from '../models/bloggers';
import { IPaginationResponse } from '../types';

export const bloggersRepositoryDB = {
  async getAllBloggers(): Promise<Bloggers[]> {
    return (await collections.bloggers?.find({}).toArray()) as unknown as Bloggers[];
  },
  async getAllPostsBloggers(
    pageSize: number,
    pageNumber: number,
    bloggerId: number,
  ): Promise<IPaginationResponse<Posts>> {
    let postsPortion: Posts[] | undefined = [];
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const startIndex = pageNumber * pageSize;
    const allBloggersPosts = await collections.posts?.find({ bloggerId });
    if (allBloggersPosts) {
      postsPortion = await collections.posts?.find({ bloggerId }).skip(startIndex).limit(pageSize).toArray();
      totalCount = await collections.posts?.find({ bloggerId }).count();
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }

    const result: IPaginationResponse<Posts> = {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: postsPortion,
    };
    return result;
  },

  async createBlogger(name: string, youtubeUrl: string) {
    const newBlogger: Bloggers = {
      id: +new Date(),
      name,
      youtubeUrl,
    };
    await collections.bloggers?.insertOne(newBlogger);

    return newBlogger;
  },
  async getBloggerById(id: number) {
    // const blogger = (await collections.bloggers?.findOne({ id }, { _id: 0 })) as unknown as Omit<Bloggers, '_id'>;
    const blogger = (await collections.bloggers?.findOne({ id })) as Bloggers;
    return blogger;
  },
  async upDateBlogger(name: string, youtubeUrl: string, id: number) {
    // const blogger = (await collections.bloggers?.findOne({ id })) as Bloggers;
    // if (blogger) {
    await collections.bloggers?.updateOne({ id: id }, { $set: { name, youtubeUrl } });
    // }
    // } else {
    //   return false;
    // }
    // const elem = bloggers.find((el) => el.id === id);
    // if (elem) {
    //   bloggers = bloggers.map((el) => {
    //     return el.id === id ? { ...el, name, youtubeUrl } : el;
    //   });
    // } else {
    //   return false;
    // }
  },
  async deleteBlogger(id: number) {
    const result = await collections.bloggers?.deleteOne({ id: id });
    return { deleteState: result?.acknowledged, deleteCount: result?.deletedCount };
    // const elem = bloggers.find((el) => el.id === id);
    // if (elem) {
    //   const index = bloggers.indexOf(elem);
    //   bloggers.splice(index, 1);
    // } else {
    //   return false;
    // }
  },
};
