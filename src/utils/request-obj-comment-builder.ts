import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import { statusType } from '../types';

export interface ICommentsRequest {
  _id?: Types.ObjectId;
  id?: Types.ObjectId;
  content: string;
  userId: any;
  postId: Types.ObjectId;
  userLogin?: string;
  addedAt: Date;
  likesInfo?: {
    dislikesCount: number;
    likesCount: number;
    myStatus: statusType;
  };
}

export const requestObjCommentBuilder = async (comment: ICommentsRequest, userStatus: statusType) => {
  comment.userLogin = comment.userId.accountData.userName;
  comment.userId = comment.userId._id;
  comment.id = comment._id;
  delete comment._id;

  const dislikesCount = await Likes.find({ commentId: comment.id, myStatus: 'Dislike' }).exec();
  const likesCount = await Likes.find({ commentId: comment.id, myStatus: 'Like' }).exec();

  comment.likesInfo = {
    dislikesCount: dislikesCount.length,
    likesCount: likesCount.length,
    myStatus: userStatus,
  };
  return comment;
};
