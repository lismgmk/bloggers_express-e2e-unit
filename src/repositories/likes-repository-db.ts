import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import 'reflect-metadata';

@injectable()
export class LikesRepositoryDB {
  async upDateLikesInfo(
    postId: string | null,
    commentId: string | null,
    status: string,
    userId: Types.ObjectId,
    login: string,
  ) {
    const usersLike = await Likes.findOne({ userId, postId, commentId });
    if (usersLike) {
      try {
        const filter = { userId: userId, postId, commentId };
        const update = {
          myStatus: status,
          addedAt: new Date(),
        };
        return await Likes.findOneAndUpdate(filter, update, {
          new: true,
        });
      } catch (err) {
        return err;
      }
    } else {
      try {
        const likeInfo = new Likes({
          postId,
          commentId,
          myStatus: status,
          addedAt: new Date(),
          login,
          userId,
        });
        return await Likes.create(likeInfo);
      } catch (err) {
        return err;
      }
    }
  }
}
