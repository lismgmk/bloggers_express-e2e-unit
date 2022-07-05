import { Router } from 'express';
import { bloggersRepository } from '../repositories/bloggers-repository';
import { IHandlerError } from '../utils/error-util';
import { bloggersPost } from './utils/bloggers-post';

export const bloggersRouter = Router({});

bloggersRouter.get('/', (req, res) => {
  res.status(200).send(bloggersRepository.getAllBloggers());
});
bloggersRouter.post('/', (req, res) => {
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };

  bloggersPost(req, res, handlerErrorInit);
  if (handlerErrorInit.errorsMessages.length === 0) {
    res.status(201).send(bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl));
  }
});

bloggersRouter.get('/:id', (req, res) => {
  bloggersRepository.getBloggerById(+req.params.id)
    ? res.status(200).send(bloggersRepository.getBloggerById(+req.params.id))
    : res.send(404);
});

bloggersRouter.put('/:id', (req, res) => {
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  if (!bloggersRepository.getBloggerById(+req.params.id)) {
    res.send(404);
  } else {
    bloggersPost(req, res, handlerErrorInit);
    if (handlerErrorInit.errorsMessages.length === 0) {
      bloggersRepository.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params.id);
      res.send(204);
    }
  }
});

bloggersRouter.delete('/:id', (req, res) => {
  if (!bloggersRepository.getBloggerById(+req.params.id) || typeof req.headers === 'undefined') {
    res.send(404);
  } else {
    bloggersRepository.deleteBlogger(+req.params.id);
    res.send(204);
  }
});
