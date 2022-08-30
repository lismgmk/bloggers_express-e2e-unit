import express from 'express';
import { validationResult } from 'express-validator';
import { injectable, inject } from 'inversify';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { CommentsRepositoryDb } from '../repositories/comments-repository-db';
import { LikesRepositoryDB } from '../repositories/likes-repository-db';
import { PostsRepositoryDB } from '../repositories/posts-repository-db';
import { errorFormatter } from '../utils/error-util';
import { userStatusUtil } from '../utils/user-status-util';

@injectable()
export class PostsController {
  constructor(
    @inject(PostsRepositoryDB) protected postsRepositoryDB: PostsRepositoryDB,
    @inject(CommentsRepositoryDb) protected commentsRepositoryDb: CommentsRepositoryDb,
    @inject(LikesRepositoryDB) protected likesRepositoryDB: LikesRepositoryDB,
  ) {}

  async getAllPosts(req: express.Request, res: express.Response) {
    const limit = parseInt(req.query?.PageSize as string) || 10;
    const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
    const allPosts = await this.postsRepositoryDB.getAllPosts(limit, pageNumber, req.user || null);
    if (typeof allPosts === 'string') {
      res.status(430).send(allPosts);
    } else {
      res.status(200).send(allPosts);
    }
  }

  async addPost(req: express.Request, res: express.Response) {
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) {
      return res.status(400).send({ errorsMessages: result.array() });
    } else {
      const newPost = await this.postsRepositoryDB.createPost(req.body);
      if (typeof newPost === 'string') {
        res.status(430).send(newPost);
      } else {
        res.status(201).send(newPost);
      }
    }
  }

  async changeLikeStatus(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const result = validationResult(req).formatWith(errorFormatter);
      const postId = req.params!.id;
      const post = await this.postsRepositoryDB.checkPostById(postId);

      if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array() });
      }
      if (!post) {
        return res.send(404);
      } else {
        const updatedPost = await this.likesRepositoryDB.upDateLikesInfo(
          postId,
          null,
          req.body.likeStatus,
          req.user!._id!,
          req.user!.accountData.userName,
        );
        if (typeof updatedPost === 'string') {
          res.status(430).send(updatedPost);
        } else {
          res.send(204);
        }
      }
    }
  }

  async getCommentByPostId(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const commentId = req.params?.id;
      const limit = parseInt(req.query?.PageSize as string) || 10;
      const pageNumber = parseInt(req.query?.PageNumber as string) || 1;
      const comments = await this.postsRepositoryDB.checkPostById(commentId);
      if (!comments) {
        res.send(404);
      } else {
        res
          .status(200)
          .send(await this.commentsRepositoryDb.getAllComments(limit, pageNumber, req.user || null, commentId));
      }
    }
  }

  async addCommentByPostId(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const postId = req.params?.id;
      const post = await this.postsRepositoryDB.checkPostById(postId);
      if (!post) {
        res.send(404);
      } else {
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
          return res.status(400).send({ errorsMessages: result.array() });
        } else {
          const userObjectId = new mongoose.Types.ObjectId(req.user!._id!);
          const postObjectId = new mongoose.Types.ObjectId(postId);
          const newComment = await this.commentsRepositoryDb.createComment(
            req.body.content,
            userObjectId,
            postObjectId,
          );
          if (typeof newComment === 'string') {
            res.status(430).send(newComment);
          } else {
            res.status(201).send(newComment);
          }
        }
      }
    }
  }

  async getPostById(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const userStatus = await userStatusUtil(req.params.id, null, req.user || null);
      const post = await this.postsRepositoryDB.getPostById(req.params.id, userStatus);
      post ? res.status(200).send(post) : res.send(404);
    }
  }

  async changePost(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const post = await this.postsRepositoryDB.checkPostById(req.params?.id);
      if (!post) {
        res.send(404);
      } else {
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
          return res.status(400).send({ errorsMessages: result.array() });
        } else {
          const updatedPost = await this.postsRepositoryDB.upDatePost(req.body, req.params?.id);
          if (typeof updatedPost === 'string') {
            res.status(430).send(updatedPost);
          } else {
            res.send(204);
          }
        }
      }
    }
  }

  async deletePost(req: express.Request, res: express.Response) {
    if (!ObjectId.isValid(req.params.id)) {
      return res.send(404);
    } else {
      const post = await this.postsRepositoryDB.checkPostById(req.params.id);
      if (!post) {
        res.send(404);
      } else {
        const deletedPost = await this.postsRepositoryDB.deletePost(req.params.id);
        if (typeof deletedPost === 'string') {
          res.status(430).send(deletedPost);
        } else {
          res.send(204);
        }
      }
    }
  }
}
