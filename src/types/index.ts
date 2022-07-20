import { ObjectId } from 'mongodb';

export interface IBloggers {
  id?: number;
  name?: string | null;
  youtubeUrl?: string | null;
}

export interface ICommentsRes {
  _id?: ObjectId;
  id?: string | null;
  content?: string | null;
  userId?: string | null;
  userLogin?: string | null;
  addedAt?: Date | null;
}
export interface IUsersRes {
  id?: string;
  login?: string | null;
}

export interface IPosts {
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId?: number;
  bloggerName?: string | null;
  id?: number;
}
export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}
