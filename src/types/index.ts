import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

export enum myStatus {
  None,
  Like,
  Dislike,
}
export interface IBloggers {
  id: Types.ObjectId;
  name: string;
  youtubeUrl?: string;
}

export type statusType = 'Like' | 'Dislike' | 'None';

export interface ILikes {
  _id: Types.ObjectId;
  postId?: Types.ObjectId;
  commentId?: Types.ObjectId;
  myStatus: statusType;
  addedAt: Date;
  userId: Types.ObjectId;
  login: string;
}

export interface IBlackList {
  id: ObjectId;
  tokenValue?: string;
}

export interface IComments {
  id: Types.ObjectId;
  content?: string | null;
  userId?: Types.ObjectId;
  addedAt?: Date | null;
  postId?: Types.ObjectId;
}

export interface IUser {
  _id?: Types.ObjectId;
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
  id?: Types.ObjectId;
  createdAt: Date;
  userIp: string;
  path: string;
}

export interface IUsersRes {
  id?: string;
  login?: string | null;
}

export interface IPosts {
  _id?: Types.ObjectId;
  shortDescription?: string;
  content?: string | null;
  title?: string | null;
  bloggerId?: string;
  bloggerName: string;
}

export interface IReqPosts {
  shortDescription: string;
  content: string;
  title: string;
  bloggerId?: string;
}

export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}

export interface IPaginationResponse<Item> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount?: number;
  items?: Item[] | [];
}

export type IAnswerStatus = 'Correct' | 'Incorrect';
export type IGameStatus = 'PendingSecondPlayer' | 'Active' | 'Finished';

export interface IAnswer {
  questionId: string;
  answerStatus: IAnswerStatus;
  addedAt: Date;
  correctAnswer: string;
}
export interface IUserQuiz {
  id: string;
  login: string;
}
export interface IPlayer {
  answers: IAnswer[];
  user: IUserQuiz;
  score: number;
}

export interface IQuestion {
  id: string;
  body: string;
}
export interface IMyCurrentGameResponse {
  id: string;
  firstPlayer: IPlayer;
  secondPlayer: IPlayer | null;
  questions: IQuestion[];
  status: IGameStatus;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
}
export interface IResPlayer {
  questionId: ObjectId;
  answerStatus: IAnswerStatus;
  addedAt: Date;
}
