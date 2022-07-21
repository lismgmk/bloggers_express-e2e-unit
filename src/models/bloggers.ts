import { ObjectId } from 'mongodb';

export class UsersModel {
  constructor(public login?: string, public hashPassword?: string, public _id?: ObjectId) {}
}
export class Bloggers {
  constructor(public name?: string, public youtubeUrl?: string, public id?: string, public _id?: ObjectId) {}
}

export class Posts {
  constructor(
    public shortDescription?: string,
    public content?: string | null,
    public title?: string | null,
    public bloggerId?: number,
    public bloggerName?: string | null,
    public id?: string,
    public _id?: ObjectId,
  ) {}
}
