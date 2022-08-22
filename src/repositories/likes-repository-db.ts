import { ObjectID } from 'mongodb';
import { Types } from 'mongoose';
import { Likes } from '../models/likesModel';
import { myStatus } from '../types';

export const likesRepositoryDB = {
  async upDateLikesInfo(postId: string, status: string, userId: Types.ObjectId, login: string) {
    const filter = { postId: new ObjectID(postId) };
    let update = {};
    let addLikeObj = null;
    if (status === 'Like') {
      addLikeObj = {
        addedAt: new Date(),
        userId: userId,
        login: login,
      };
      update = {
        $cond: {
          if: {
            newestLikes: { $lte: { $size: 3 } },
            then: { $push: { newestLikes: addLikeObj } },
            else: { $and: [{ $pop: { newestLikes: -1 } }, { $push: { newestLikes: addLikeObj } }] },
          },
        },
        addedAt: new Date(),
        $inc: { likesCount: 1 },
        myStatus: myStatus,
      };
    } else {
      update = { addedAt: new Date(), $inc: { dislikesCount: 1 }, myStatus: myStatus };
    }
    // // Query the supplies collection using the aggregation expression
    // db.supplies.find({ $expr: { $lt: [discountedPrice, NumberDecimal('5')] } });
    //
    // const update = {};
    try {
      const newStatus = await Likes.findOneAndUpdate(filter, update, {
        new: true,
      });
      console.log(newStatus, 'newStatus');
    } catch (err) {
      return err;
    }
  },
};
