import { ObjectId } from 'mongodb';
import { IReqPosts } from '../types';

export const pageSize = 3;
export const pageNumber = 1;
export const adminToken = { correct: 'YWRtaW46cXdlcnR5', wrong: '00000000000' };

export const newUser1 = {
  login: 'User-1',
  password: '123456',
  email: 'someemail-1@mail.mail',
  userIp: '1a',
  confirmationCode: '11',
};

export const newUser2 = {
  login: 'User-2',
  password: '123456',
  email: 'someemail-2@mail.mail',
  userIp: '2a',
  confirmationCode: '22',
};
export const invalidUser = {
  login: 'Us',
  password: '12',
  email: 'someemailmail.mail',
};

//for bloggers route and repository
export const filterNameSlice = 'V';
export const newBlogger_1 = {
  name: 'Vova',
  youtubeUrl: 'https://newChanel1.com',
};
export const newBlogger_2 = {
  name: 'Ira',
  youtubeUrl: 'https://newChanel2.com',
};
export const newBlogger_3 = {
  name: 'Veranika',
  youtubeUrl: 'https://newChanel3.com',
};

export const incorrectUrlBlogger = {
  name: 'new blogger',
  youtubeUrl: 'https/newChanel.com',
};
export const fakeId = { id: '63112e36862987f5978863c8' };

//for post router

export const newPost_1_fn: (val: string) => IReqPosts = (bloggerId: string) => ({
  shortDescription: 'some information about post_1',
  content: 'all data for post_1....',
  title: 'post_1 title',
  bloggerId,
});

//for players repository

export const player_1 = {
  userId: new ObjectId(),
  playerId: new ObjectId(),
  gameId: new ObjectId(),
  login: 'User-1',
};
export const player_2 = {
  userId: new ObjectId(),
  playerId: new ObjectId(),
  gameId: new ObjectId(),
  login: 'User-1',
};
