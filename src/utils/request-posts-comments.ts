import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import { statusType } from '../types';
export interface IPostsRequest {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
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

export interface ICommentsRequest {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
  content: string;
  userId: any;
  postId?: Types.ObjectId;
  userLogin?: string;
  addedAt: Date;
  likesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: statusType;
  };
}

export class RequestBuilder {
  constructor(
    protected post: IPostsRequest | null,
    protected comment: ICommentsRequest | null,
    protected userStatus: statusType = 'None',
  ) {}

  async commentObj() {
    if (this.comment) {
      this.comment.userLogin = this.comment.userId.accountData.userName;
      this.comment.userId = this.comment.userId._id;
      this.comment.id = this.comment._id;
      delete this.comment._id;
      delete this.comment.postId;

      const dislikesCount = await Likes.find({ commentId: this.comment.id, myStatus: 'Dislike' }).exec();
      const likesCount = await Likes.find({ commentId: this.comment.id, myStatus: 'Like' }).exec();

      this.comment.likesInfo = {
        dislikesCount: dislikesCount.length,
        likesCount: likesCount.length,
        myStatus: this.userStatus || 'None',
      };
    }
    return this.comment;
  }
  async postObj() {
    if (this.post) {
      this.post.bloggerName = this.post.bloggerId.name;
      this.post.bloggerId = this.post.bloggerId!._id;
      this.post.id = this.post._id;
      delete this.post._id;

      const dislikesCount = await Likes.find({ postId: this.post.id, myStatus: 'Dislike' }).exec();
      const likesCount = await Likes.find({ postId: this.post.id, myStatus: 'Like' }).sort({ addedAt: -1 }).exec();
      const newestLikes = likesCount.slice(0, 3).map((el) => {
        return {
          addedAt: el.addedAt,
          userId: el.userId,
          login: el.login,
        };
      });
      this.post.extendedLikesInfo = {
        dislikesCount: dislikesCount.length,
        likesCount: likesCount.length,
        myStatus: this.userStatus,
        newestLikes,
      };
    }

    return this.post;
  }
}
