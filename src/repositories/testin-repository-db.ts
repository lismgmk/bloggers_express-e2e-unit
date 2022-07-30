import { collections } from '../connect-db';

export const testingRepositoryDB = {
  async deleteAll() {
    const resultBloggers = await collections.bloggers?.deleteMany({});
    const resultPosts = await collections.posts?.deleteMany({});
    const resultComments = await collections.comments?.deleteMany({});
    const resultUsers = await collections.users?.deleteMany({});
    const ipUserLogin = await collections.ipUsersLogin?.deleteMany({});
    const ipUserResending = await collections.ipUsersResending?.deleteMany({});
    const ipUserRegistration = await collections.ipUsersRegistration?.deleteMany({});
    const ipUserConfirmation = await collections.ipUsersConfirmation?.deleteMany({});
    const ipUsers = await collections.ipUsers?.deleteMany({});
    if (
      resultBloggers?.acknowledged &&
      resultComments?.acknowledged &&
      resultPosts?.acknowledged &&
      ipUserLogin?.acknowledged &&
      ipUserResending?.acknowledged &&
      ipUserRegistration?.acknowledged &&
      ipUserConfirmation?.acknowledged &&
      ipUsers?.acknowledged &&
      resultUsers?.acknowledged
    ) {
      return true;
    }
  },
};
