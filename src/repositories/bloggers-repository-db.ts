import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { Bloggers } from '../models/bloggersModel';
import { IBloggers, IPaginationResponse } from '../types';

@injectable()
export class BloggersRepositoryDB {
  async getAllBloggers(
    pageSize: number,
    pageNumber: number,
    bloggerNamePart: string,
  ): Promise<IPaginationResponse<IBloggers>> {
    let totalCount: number | undefined = 0;
    let totalPages = 0;
    const namePart = new RegExp(bloggerNamePart);
    totalCount = await Bloggers.find({ name: namePart }).count().lean();
    const allBloggers = await (
      await Bloggers.find({ name: namePart })
        .skip(pageNumber > 0 ? (pageNumber - 1) * pageSize : 0)
        .limit(pageSize)
        .lean()
    ).map((i) => {
      return { id: i._id, name: i.name, youtubeUrl: i.youtubeUrl };
    });
    if (allBloggers) {
      totalPages = Math.ceil((totalCount || 0) / pageSize);
    }
    return {
      pagesCount: totalPages,
      page: pageNumber,
      pageSize,
      totalCount,
      items: allBloggers,
    };
  }

  async createBlogger(name: string, youtubeUrl: string): Promise<IBloggers | string> {
    const newBlogger = new Bloggers({
      name,
      youtubeUrl,
    });
    try {
      await Bloggers.create(newBlogger);
      return { id: newBlogger._id, name: newBlogger.name, youtubeUrl: newBlogger.youtubeUrl };
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }

  async getBloggerById(id: string) {
    return Bloggers.findById(id);
  }
  async upDateBlogger(name: string, youtubeUrl: string, id: string) {
    try {
      return await Bloggers.findByIdAndUpdate(id, { $set: { name, youtubeUrl } });
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
  async deleteBlogger(id: string) {
    try {
      const idVal = new ObjectId(id);
      return await Bloggers.findByIdAndDelete(idVal);
    } catch (err) {
      return `Fail in DB: ${err}`;
    }
  }
}
