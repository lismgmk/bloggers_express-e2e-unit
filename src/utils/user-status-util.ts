import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import { IUser, statusType } from '../types';

export const userStatusUtil = async (
  postId: string | Types.ObjectId | null,
  commentId: string | Types.ObjectId | null,
  user?: IUser,
) => {
  let userStatus: statusType = 'None';
  if (user) {
    const filter = postId !== null ? { userId: user._id, postId } : { userId: user._id, commentId };
    const enteredUser = await Likes.findOne(filter).exec();
    enteredUser && (userStatus = enteredUser.myStatus);
  }
  return userStatus;
};
