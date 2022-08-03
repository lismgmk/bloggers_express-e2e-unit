import { collections } from '../connect-db';

export const testingRepositoryDB = {
  async deleteAll() {
    const resultBloggers = await collections.bloggers?.deleteMany({});
    const resultPosts = await collections.posts?.deleteMany({});
    const resultComments = await collections.comments?.deleteMany({});
    const resultUsers = await collections.users?.deleteMany({});
    const ipUsers = await collections.ipUsers?.deleteMany({});
    if (
      resultBloggers?.acknowledged &&
      resultComments?.acknowledged &&
      resultPosts?.acknowledged &&
      ipUsers?.acknowledged &&
      resultUsers?.acknowledged
    ) {
      return true;
    }
  },
};
