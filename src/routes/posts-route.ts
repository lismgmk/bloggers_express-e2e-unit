import { Router } from 'express';
import { postsRepository } from '../repositories/posts-repository';
import { errorResponse, IHandlerError } from '../utils/error-util';
import { postsPost } from './utils/posts-post';
import { bloggersRepository } from '../repositories/bloggers-repository';

export const postsRouter = Router({});

postsRouter.get('/', (req, res) => {
  res.status(200).send(postsRepository.getAllPosts());
});
postsRouter.post('/', (req, res) => {
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  if (!bloggersRepository.getBloggerById(+req.body.bloggerId)) {
    res.status(400).send(errorResponse(`is null or incorrect`, 'bloggerId', handlerErrorInit));
  } else {
    postsPost(req, res, handlerErrorInit);
    if (handlerErrorInit.errorsMessages.length === 0) {
      res.status(201).send(postsRepository.createPost(req.body));
    }
  }
});

postsRouter.get('/:id', (req, res) => {
  postsRepository.getPostById(+req.params.id)
    ? res.status(200).send(postsRepository.getPostById(+req.params.id))
    : res.send(404);
});

postsRouter.put('/:id', (req, res) => {
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  if (!postsRepository.getPostById(+req.params.id)) {
    res.send(404);
  } else {
    postsPost(req, res, handlerErrorInit);
    if (handlerErrorInit.errorsMessages.length === 0) {
      postsRepository.upDatePost(req.body, +req.params.id);
      res.send(204);
    }
  }
});

postsRouter.delete('/:id', (req, res) => {
  if (!postsRepository.getPostById(+req.params.id)) {
    res.send(404);
  } else {
    postsRepository.deletePost(+req.params.id);
    res.send(204);
  }
});
