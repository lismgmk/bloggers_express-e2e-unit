import { ObjectId } from 'mongodb';

export interface IBloggers {
  id?: string;
  name?: string | null;
  youtubeUrl?: string | null;
}

export interface ICommentsRes {
  _id?: ObjectId;
  id?: string | null;
  content?: string | null;
  userId?: string;
  userLogin?: string | null;
  addedAt?: Date | null;
  postId?: string;
}

export interface IUser {
  accountData: {
    userName: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    userIp: string;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
    attemptCount: number;
  };
}

export interface IIpUser {
  createdAt: Date;
  userIp: string;
  attempt: number;
}

export interface IUsersRes {
  id?: string;
  login?: string | null;
}

export interface IPosts {
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId?: string;
  bloggerName?: string | null;
  id?: string;
}
export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}
