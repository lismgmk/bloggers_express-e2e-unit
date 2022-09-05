import express from 'express';
import { validationResult } from 'express-validator';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { BloggersRepositoryDB } from '../repositories/bloggers-repository-db';
import { PostsRepositoryDB } from '../repositories/posts-repository-db';
import { errorFormatter } from '../utils/error-util';

@injectable()
export class BloggersController {
  constructor(
    @inject(BloggersRepositoryDB) protected bloggersRepositoryDB: BloggersRepositoryDB,
    @inject(PostsRepositoryDB) protected postsRepositoryDB: PostsRepositoryDB,
  ) {}

  async getAllBloggers(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query?.PageSize as string) || 10;
    const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
    const SearchNameTerm = req.query?.SearchNameTerm as string;
    res.status(200).send(await this.bloggersRepositoryDB.getAllBloggers(limit, pageNumber, SearchNameTerm));
  }

  async addBlogger(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const newBlogger = await this.bloggersRepositoryDB.createBlogger(req.body.name, req.body.youtubeUrl);
      if (typeof newBlogger === 'string') {
        res.status(400).send(newBlogger);
      } else {
        res.status(201).send(newBlogger);
      }
    }
  }

  async getBloggerById(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.sendStatus(404);
    } else {
      const blogger = await this.bloggersRepositoryDB.getBloggerById(req.params.id);
      if (!blogger) {
        res.status(404).send(blogger);
      } else {
        res.status(200).send(blogger);
      }
    }
  }

  async getPostsForBloggerId(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.bloggerId)) {
      return res.send(404);
    } else {
      const blogger = await this.bloggersRepositoryDB.getBloggerById(req.params.bloggerId);
      if (blogger) {
        const limit = parseInt(req.query?.PageSize as string) || 10;
        const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
        const bloggerId = req.params.bloggerId;
        const bloggersPostsSlice = await this.postsRepositoryDB.getAllPosts(
          limit,
          pageNumber,
          req.user || null,
          bloggerId,
        );
        if (typeof bloggersPostsSlice === 'string') {
          res.status(400).send(bloggersPostsSlice);
        } else {
          res.status(200).send(bloggersPostsSlice);
        }
      } else {
        res.send(404);
      }
    }
  }

  async changePostsForBloggerId(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.bloggerId)) {
      return res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      }
      const blogger = await this.bloggersRepositoryDB.getBloggerById(req.params.bloggerId);
      if (blogger) {
        const bloggerId = req.params.bloggerId;
        const newPost = await this.postsRepositoryDB.createPost({ ...req.body, bloggerId });
        if (typeof newPost === 'string') {
          res.status(400).send(newPost);
        } else {
          res.status(201).send(newPost);
        }
      } else {
        res.send(404);
      }
    }
  }

  async changeBlogger(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      } else {
        const blogger = await this.bloggersRepositoryDB.getBloggerById(req.params?.id);
        if (!blogger) {
          res.sendStatus(404);
        } else {
          const updatedBlogger = await this.bloggersRepositoryDB.upDateBlogger(
            req.body.name,
            req.body.youtubeUrl,
            req.params?.id,
          );
          if (typeof updatedBlogger === 'string') {
            res.status(404).send(updatedBlogger);
          } else {
            res.send(204);
          }
        }
      }
    }
  }

  async deleteBlogger(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.sendStatus(404);
    } else {
      const blogger = await this.bloggersRepositoryDB.getBloggerById(req.params?.id);
      if (!blogger) {
        res.sendStatus(404);
      } else {
        const deletedBlogger = await this.bloggersRepositoryDB.deleteBlogger(req.params.id);
        if (typeof deletedBlogger === 'string') {
          res.status(400).send(deletedBlogger);
        } else {
          res.sendStatus(204);
        }
      }
    }
  }
}
