import { BlackList } from '../models/blackListModel';
import { Bloggers } from '../models/bloggersModel';
import { Comments } from '../models/commentsModel';
import { IpUsers } from '../models/ipUserModel';
import { Likes } from '../models/likesModel';
import { Posts } from '../models/postsModel';
import { Users } from '../models/usersModel';

export const testingRepositoryDB = {
  async deleteAll() {
    try {
      const resultBloggers = await Bloggers.deleteMany({}).lean();
      const resultPosts = await Posts.deleteMany({});
      const resultComments = await Comments.deleteMany({});
      const resultUsers = await Users.deleteMany({});
      const ipUsers = await IpUsers.deleteMany({});
      const blackListTokens = await BlackList.deleteMany({});
      const likes = await Likes.deleteMany({});
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
};
