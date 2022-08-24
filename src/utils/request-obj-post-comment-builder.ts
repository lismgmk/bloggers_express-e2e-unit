import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import { statusType } from '../types';

export interface IPostsRequest {
  _id?: Types.ObjectId;
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId: any;
  bloggerName: string;
  addedAt: Date;
  extendedLikesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: statusType;
    newestLikes: { addedAt: Date; userId: Types.ObjectId; login: string }[];
  };
}

export const requestObjPostCommentBuilder = async (post: IPostsRequest, userStatus: statusType) => {
  post.bloggerName = post.bloggerId.name;
  post.bloggerId = post.bloggerId!._id;

  const dislikesCount = await Likes.find({ postId: post._id, myStatus: 'Dislike' }).exec();
  const likesCount = await Likes.find({ postId: post._id, myStatus: 'Like' }).sort({ date: -1 }).exec();
  const newestLikes = likesCount.slice(0, 2).map((el) => {
    return {
      addedAt: el.addedAt,
      userId: el.userId,
      login: el.login,
    };
  });
  post.extendedLikesInfo = {
    dislikesCount: dislikesCount.length,
    likesCount: likesCount.length,
    myStatus: userStatus,
    newestLikes,
  };
  return post;
};
