import { Likes } from '../models/likesModel';
import { IUser, statusType } from '../types';

export const userStatusUtil = async (postId: string, user?: IUser) => {
  let userStatus: statusType = 'None';
  if (user) {
    const enteredUser = await Likes.findOne({ userId: user._id, postId }).exec();
    enteredUser && (userStatus = enteredUser.myStatus);
  }
  return userStatus;
};
