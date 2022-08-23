import { ObjectID } from 'mongodb';
import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';

export const likesRepositoryDB = {
  async upDateLikesInfo(postId: string, status: string, userId: Types.ObjectId, login: string) {
    const usersLike = await Likes.findOne({ userId: userId, postId: new ObjectID(postId) });
    if (usersLike) {
      try {
        const filter = { userId: userId, postId: new ObjectID(postId) };
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
          postId: new Types.ObjectId(postId),
          commentId: null,
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
    //   try {
    //     const filter = { postId: new ObjectID(postId) };
    //     let update = {};
    //     let addLikeObj = null;
    //     if (status === 'Like') {
    //       addLikeObj = {
    //         addedAt: new Date(),
    //         userId: userId,
    //         login: login,
    //       };
    //       update = {
    //         $cond: {
    //           if: {
    //             newestLikes: { $lt: { $size: 3 } },
    //             then: { $push: { newestLikes: addLikeObj } },
    //             else: { $and: [{ $pop: { newestLikes: -1 } }, { $push: { newestLikes: addLikeObj } }] },
    //           },
    //         },
    //         addedAt: new Date(),
    //         $inc: { likesCount: 1 },
    //         myStatus: status,
    //         // $push: { newestLikes: addLikeObj },
    //       };
    //     } else {
    //       update = { addedAt: new Date(), $inc: { dislikesCount: 1 }, myStatus: status };
    //     }
    //
    //     // console.log(filter, update, 'filter update');
    //     try {
    //       const newStatus = await Likes.findOneAndUpdate(filter, update, {
    //         new: true,
    //       });
    //     } catch (err) {
    //       console.log(err, 'eeeeeeeeeeeeeeeeee');
    //     }
    //
    //     // console.log(newStatus, 'newStatus');
    //   } catch (err) {
    //     return err;
    //   }
  },
};
