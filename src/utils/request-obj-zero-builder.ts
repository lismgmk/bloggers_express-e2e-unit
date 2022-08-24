// export interface IPostsRequest {
//   _id?: Types.ObjectId;
//   shortDescription?: string;
//   content?: string | null;
//   title?: string | null;
//   bloggerId: any;
//   bloggerName: string;
//   addedAt: Date;
//   extendedLikesInfo?: {
//     dislikesCount: number;
//     likesCount: number;
//     myStatus: statusType;
//     newestLikes: { addedAt: Date; userId: Types.ObjectId; login: string }[];
//   };
// }

export const requestObjZeroBuilder = (post: any) => {
  post.bloggerName = post.bloggerId.name;
  post.bloggerId = post.bloggerId!._id;
  post.id = post._id;
  delete post._id;
  const userStatus = 'None';
  const dislikesCount = 0;
  const likesCount = 0;
  post.extendedLikesInfo = {
    dislikesCount: dislikesCount,
    likesCount: likesCount,
    myStatus: userStatus,
    newestLikes: [],
  };
  return post;
};
