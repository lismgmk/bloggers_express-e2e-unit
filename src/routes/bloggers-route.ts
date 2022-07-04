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
  // const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  // if (req.body.name !== null && Object.keys(req.body).find((el) => el === 'name') && req.body.name.trim().length > 15) {
  //   errorResponse('name length more than 15', 'name', handlerErrorInit);
  // }
  // if (
  //   req.body.youtubeUrl !== null &&
  //   Object.keys(req.body).find((el) => el === 'youtubeUrl') &&
  //   (req.body.youtubeUrl.trim().length > 100 ||
  //     !new RegExp(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).test(req.body.youtubeUrl))
  // ) {
  //   errorResponse('youtubeUrl length more than 100 or error pattern', 'youtubeUrl', handlerErrorInit);
  // }
  // if (req.body.name === null || !Object.keys(req.body).find((el) => el === 'name')) {
  //   errorResponse('name equal null', 'name', handlerErrorInit);
  // }
  // if (req.body.youtubeUrl === null || !Object.keys(req.body).find((el) => el === 'youtubeUrl')) {
  //   errorResponse('youtubeUrl equal null', 'youtubeUrl', handlerErrorInit);
  // }
  // if (handlerErrorInit.errorsMessages.length > 0) {
  //   res.status(400).send(handlerErrorInit);
  // } else {
  //   res.status(201).send(bloggersRepository.createBlogger(req.body.name, req.body.youtubeUrl));
  // }
});

bloggersRouter.get('/:id', (req, res) => {
  bloggersRepository.getBloggerById(+req.params.id)
    ? res.status(200).send(bloggersRepository.getBloggerById(+req.params.id))
    : res.send(404);
});

bloggersRouter.put('/:id', (req, res) => {
  // const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  // if (!bloggersRepository.getBloggerById(+req.params.id)) {
  //   res.send(404);
  // } else {
  //   if (
  //     req.body.name !== null &&
  //     Object.keys(req.body).find((el) => el === 'name') &&
  //     req.body.name.trim().length > 15
  //   ) {
  //     errorResponse('ame length more than 15', 'name', handlerErrorInit);
  //   }
  //   if (
  //     req.body.youtubeUrl !== null &&
  //     Object.keys(req.body).find((el) => el === 'youtubeUrl') &&
  //     (req.body.youtubeUrl.trim().length > 100 ||
  //       !new RegExp(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).test(req.body.youtubeUrl))
  //   ) {
  //     errorResponse('youtubeUrl length more than 100 or error pattern', 'youtubeUrl', handlerErrorInit);
  //   }
  //   if (req.body.name === null || !Object.keys(req.body).find((el) => el === 'name')) {
  //     errorResponse('name equal null', 'name', handlerErrorInit);
  //   }
  //   if (req.body.youtubeUrl === null || !Object.keys(req.body).find((el) => el === 'youtubeUrl')) {
  //     errorResponse('youtubeUrl equal null', 'youtubeUrl', handlerErrorInit);
  //   }
  //   if (handlerErrorInit.errorsMessages.length > 0) {
  //     res.status(400).send(handlerErrorInit);
  //   } else {
  //     bloggersRepository.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params.id);
  //     res.send(204);
  //   }
  // }
  const handlerErrorInit: IHandlerError = { errorsMessages: [] };
  bloggersPost(req, res, handlerErrorInit);
  if (handlerErrorInit.errorsMessages.length === 0) {
    bloggersRepository.upDateBlogger(req.body.name, req.body.youtubeUrl, +req.params.id);
    res.send(204);
  }
});

bloggersRouter.delete('/:id', (req, res) => {
  if (!bloggersRepository.getBloggerById(+req.params.id)) {
    res.send(404);
  } else {
    bloggersRepository.deleteBlogger(+req.params.id);
    res.send(204);
  }
});
