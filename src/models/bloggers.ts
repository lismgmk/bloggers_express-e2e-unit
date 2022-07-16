import { ObjectId } from 'mongodb';

export class Bloggers {
  constructor(public name?: string, public youtubeUrl?: string, public id?: number, public _id?: ObjectId) {}
}

export class Posts {
  constructor(
    public shortDescription?: string,
    public content?: string | null,
    public title?: string | null,
    public bloggerId?: number,
    public bloggerName?: string | null,
    public id?: number,
    public _id?: ObjectId,
  ) {}
}
