export const requestCommentZeroBuilder = (comment: any) => {
  comment.userLogin = comment.userId.accountData.userName;
  comment.userId = comment.userId._id;
  comment.id = comment._id;
  delete comment._id;
  const userStatus = 'None';
  const dislikesCount = 0;
  const likesCount = 0;
  comment.likesInfo = {
    dislikesCount: dislikesCount,
    likesCount: likesCount,
    myStatus: userStatus,
  };
  return comment;
};
